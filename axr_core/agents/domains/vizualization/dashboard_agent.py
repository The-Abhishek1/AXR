# axr_core/agents/domains/visualization/dashboard_agent.py
from typing import Dict, List, Any, Optional
import json
import os
import logging
from datetime import datetime

from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType

logger = logging.getLogger(__name__)

class DashboardAgent(BaseAgent):
    name = "dashboard_agent"
    domain = "visualization"
    task_types = [TaskType.DASHBOARD, TaskType.REPORT]
    capabilities = [
        "create_dashboard",
        "data_visualization",
        "metric_tracking",
        "performance_monitoring",
        "create_charts"
    ]
    rating = 4.4
    cost_per_run = 0.002
    avg_latency = 100
    
    async def execute(self, task: Dict, context: TaskContext) -> Dict:
        """Execute dashboard creation task"""
        dashboard_type = task.get("dashboard_type", "process")
        
        if dashboard_type == "process":
            return await self._create_process_dashboard(context)
        elif dashboard_type == "system":
            return await self._create_system_dashboard(task, context)
        elif dashboard_type == "custom":
            return await self._create_custom_dashboard(task, context)
        
        return {"error": f"Unknown dashboard type: {dashboard_type}"}
    
    async def _create_process_dashboard(self, context: TaskContext) -> Dict:
        """Create dashboard for current process"""
        dashboard = {
            "process_id": context.process_id,
            "goal": context.goal,
            "start_time": context.start_time.isoformat(),
            "status": "running",
            "steps": {
                "total": len(context.steps),
                "completed": len(context.step_results),
                "failed": len(context.failed_steps),
                "modified": len(context.modifications)
            },
            "created_tools": context.created_tools,
            "recent_outputs": {k: str(v)[:100] for k, v in list(context.step_results.items())[-5:]}
        }
        
        # Generate HTML dashboard
        html = self._generate_html_dashboard(dashboard)
        
        # Save dashboard
        dashboard_path = f"/tmp/axr_dashboard_{context.process_id[:8]}.html"
        with open(dashboard_path, "w") as f:
            f.write(html)
        
        return {
            "success": True,
            "dashboard": dashboard,
            "html_path": dashboard_path,
            "agent": self.name
        }
    
    async def _create_system_dashboard(self, task: Dict, context: TaskContext) -> Dict:
        """Create system-wide dashboard"""
        # Get metrics from various sources
        metrics = {
            "total_processes": len(context.step_results),  # Simplified
            "active_agents": len(context.messages),  # Simplified
            "created_tools": context.created_tools,
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "metrics": metrics,
            "agent": self.name
        }
    
    async def _create_custom_dashboard(self, task: Dict, context: TaskContext) -> Dict:
        """Create custom dashboard based on requirements"""
        requirements = task.get("requirements", {})
        data = task.get("data", {})
        
        dashboard = {
            "title": requirements.get("title", "Custom Dashboard"),
            "sections": requirements.get("sections", []),
            "data": data,
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "dashboard": dashboard,
            "agent": self.name
        }
    
    def _generate_html_dashboard(self, data: Dict) -> str:
        """Generate HTML dashboard"""
        return f"""<!DOCTYPE html>
<html>
<head>
    <title>AXR Process Dashboard</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: auto; }}
        .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .stat-value {{ font-size: 2em; font-weight: bold; color: #2c3e50; }}
        .stat-label {{ color: #7f8c8d; margin-top: 5px; }}
        .section {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .tool-tag {{ background: #3498db; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; margin: 2px; }}
        .output {{ background: #ecf0f1; padding: 10px; border-radius: 3px; margin: 5px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Process Dashboard: {data['process_id'][:8]}</h1>
            <p>{data['goal']}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">{data['steps']['total']}</div>
                <div class="stat-label">Total Steps</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{data['steps']['completed']}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{data['steps']['failed']}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{data['steps']['modified']}</div>
                <div class="stat-label">Modifications</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Created Tools</h2>
            {self._format_tools(data['created_tools'])}
        </div>
        
        <div class="section">
            <h2>Recent Outputs</h2>
            {self._format_outputs(data['recent_outputs'])}
        </div>
    </div>
</body>
</html>"""
    
    def _format_tools(self, tools: List[str]) -> str:
        if not tools:
            return "<p>No tools created</p>"
        return ''.join([f'<span class="tool-tag">{tool}</span>' for tool in tools])
    
    def _format_outputs(self, outputs: Dict) -> str:
        if not outputs:
            return "<p>No outputs yet</p>"
        html = ""
        for key, value in outputs.items():
            html += f'<div class="output"><strong>{key}:</strong> {value}</div>'
        return html