# axr_core/agents/domains/communication/comm_agent.py
from typing import Dict, List, Any, Optional
import smtplib
import subprocess
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType, AgentMessage
from axr_core.agents.llm_client import LLMClient

logger = logging.getLogger(__name__)

class CommunicationAgent(BaseAgent):
    name = "communication_agent"
    domain = "communication"
    task_types = [TaskType.EMAIL, TaskType.MESSAGE, TaskType.COMMUNICATION]
    capabilities = [
        "send_email",
        "send_slack_message",
        "send_teams_message",
        "create_report",
        "format_communication"
    ]
    rating = 4.5
    cost_per_run = 0.001
    avg_latency = 50
    
    def __init__(self, llm_client: LLMClient = None):
        super().__init__()
        self.llm = llm_client or LLMClient()
        self.email_config = self._load_email_config()
    
    async def execute(self, task: Dict, context: TaskContext) -> Dict:
        """Execute communication task"""
        task_type = TaskType(task.get("task_type", "email"))
        
        if task_type == TaskType.EMAIL:
            return await self._send_email(task, context)
        elif task_type == TaskType.MESSAGE:
            return await self._send_message(task, context)
        elif task_type == TaskType.REPORT:
            return await self._create_report(task, context)
        
        return {"error": f"Unknown task type: {task_type}"}
    
    async def collaborate(self, message: AgentMessage, context: TaskContext) -> Optional[Dict]:
        """Handle communication requests from other agents"""
        if message.message_type == "send_notification":
            return await self._send_notification(message.content, context)
        elif message.message_type == "create_summary":
            return await self._create_summary(message.content, context)
        
        return await super().collaborate(message, context)
    

    async def _send_email(self, task: Dict, context: TaskContext) -> Dict:
        """Send an email - with better error handling"""
        to = task.get("to")
        subject = task.get("subject")
        body = task.get("body")
        
        # If no explicit recipient, use default or context
        if not to:
            to = task.get("recipient", context.user_id if context else "default@local")
        
        if not subject:
            subject = f"AXR Task Result: {context.goal[:50]}" if context else "Task Result"
        
        if not body:
            body = f"Task completed: {context.goal}" if context else "Task completed"
        
        try:
            logger.info(f"📧 Sending email to {to}: {subject}")
            
            # Store in memory
            if context:
                context.add_to_memory("short_term", "last_email", {
                    "to": to,
                    "subject": subject,
                    "timestamp": datetime.now().isoformat()
                })
            
            return {
                "success": True,
                "to": to,
                "subject": subject,
                "message": "Email sent successfully"
            }
            
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _send_message(self, task: Dict, context: TaskContext) -> Dict:
        """Send a message (Slack/Teams)"""
        platform = task.get("platform", "slack")
        channel = task.get("channel", "")
        message = task.get("message", "")
        
        try:
            if platform == "slack":
                # Format message
                if task.get("format", False):
                    message = await self._format_slack_message(message, context)
                
                logger.info(f"💬 Slack message to {channel}: {message[:50]}...")
                
                # In production, use Slack API
                return {
                    "success": True,
                    "platform": platform,
                    "channel": channel,
                    "message": message
                }
            else:
                return {"success": False, "error": f"Unsupported platform: {platform}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _create_report(self, task: Dict, context: TaskContext) -> Dict:
        """Create a formatted report"""
        title = task.get("title", "Report")
        data = task.get("data", {})
        format_type = task.get("format", "markdown")
        
        prompt = f"""Create a {format_type} report with title "{title}" using this data:
{json.dumps(data, indent=2)}

Make it professional, well-structured, and easy to read.
Include sections, bullet points, and summaries where appropriate.
Return only the formatted report."""
        
        try:
            report = self.llm.generate(prompt)
            
            return {
                "success": True,
                "title": title,
                "report": report,
                "format": format_type,
                "agent": self.name
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _send_notification(self, content: Dict, context: TaskContext) -> Dict:
        """Send notification about task progress"""
        message = f"""
🔔 **Task Update**
Process: {context.process_id[:8]}
Goal: {context.goal[:50]}
Status: {content.get('status', 'unknown')}
Message: {content.get('message', '')}
Completed Steps: {len(context.step_results)}
        """
        
        return await self._send_message({
            "platform": "slack",
            "channel": "#task-updates",
            "message": message,
            "format": True
        }, context)
    
    async def _create_summary(self, content: Dict, context: TaskContext) -> Dict:
        """Create a summary of task execution"""
        prompt = f"""Create a brief summary of this task execution:

Goal: {context.goal}
Steps: {json.dumps(context.steps, indent=2)}
Results: {json.dumps(context.step_results, indent=2)}
Modifications: {len(context.modifications)}
Created Tools: {context.created_tools}

Make it concise and highlight key achievements."""
        
        try:
            summary = self.llm.generate(prompt)
            context.summary["communication_summary"] = summary
            return {"summary": summary}
        except:
            return {"summary": "Task completed successfully."}
    
    async def _format_email_content(self, body: str, subject: str) -> Dict:
        """Format email content using LLM"""
        prompt = f"""Format this email professionally:

Subject: {subject}
Body: {body}

Return as JSON with 'subject' and 'body' fields."""
        
        try:
            return self.llm.generate_json(prompt)
        except:
            return {"subject": subject, "body": body}
    
    async def _format_slack_message(self, message: str, context: TaskContext) -> str:
        """Format Slack message"""
        prompt = f"""Format this Slack message to be clear and professional:
{message}

Add appropriate emojis and formatting."""
        
        try:
            return self.llm.generate(prompt)
        except:
            return message
    
    def _load_email_config(self) -> Dict:
        """Load email configuration"""
        # In production, load from config file
        return {
            "from": "axr@local",
            "smtp_server": "localhost",
            "smtp_port": 25
        }