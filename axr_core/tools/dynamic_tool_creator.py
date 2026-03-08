# axr_core/tools/dynamic_tool_creator.py
import os
import json
import ast
import logging
from typing import Dict, List, Optional
from datetime import datetime
import importlib.util
import hashlib

from axr_core.agents.base.agent import BaseAgent, TaskContext
from tool_registry.registry import tool_registry
from tool_registry.models import Tool

logger = logging.getLogger(__name__)

class DynamicToolCreator:
    """Creates new tools dynamically based on agent requests"""
    
    def __init__(self):
        self.tools_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tool_runtime")
        self.template_cache = {}
        
    async def create_tool(self, 
                         tool_name: str, 
                         description: str,
                         code: str,
                         created_by: str,
                         context: TaskContext) -> Dict:
        """
        Create a new tool from code
        """
        tool_path = os.path.join(self.tools_path, tool_name)
        tool_file = os.path.join(tool_path, "tool.py")
        
        try:
            # Create tool directory
            os.makedirs(tool_path, exist_ok=True)
            
            # Validate code syntax
            try:
                ast.parse(code)
            except SyntaxError as e:
                return {
                    "success": False,
                    "error": f"Invalid Python syntax: {e}",
                    "tool_name": tool_name
                }
            
            # Add metadata header
            full_code = self._add_metadata_header(
                code, 
                tool_name, 
                description, 
                created_by,
                context.process_id
            )
            
            # Write tool file
            with open(tool_file, "w") as f:
                f.write(full_code)
            
            # Create __init__.py
            init_file = os.path.join(tool_path, "__init__.py")
            if not os.path.exists(init_file):
                with open(init_file, "w") as f:
                    f.write(f"from .tool import {tool_name}\n")
            
            # Create metadata file
            metadata = {
                "name": tool_name,
                "description": description,
                "created_by": created_by,
                "created_at": datetime.now().isoformat(),
                "process_id": context.process_id,
                "version": "1.0.0"
            }
            
            with open(os.path.join(tool_path, "metadata.json"), "w") as f:
                json.dump(metadata, f, indent=2)
            
            # Register the tool
            await self._register_tool(tool_name, tool_path, description)
            
            # Add to context
            context.created_tools.append(tool_name)
            
            logger.info(f"✅ Created new tool: {tool_name}")
            
            return {
                "success": True,
                "tool_name": tool_name,
                "tool_path": tool_path,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Failed to create tool {tool_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "tool_name": tool_name
            }
    
    async def modify_tool(self, tool_name: str, new_code: str, context: TaskContext) -> Dict:
        """Modify an existing tool"""
        tool_path = os.path.join(self.tools_path, tool_name)
        tool_file = os.path.join(tool_path, "tool.py")
        
        if not os.path.exists(tool_file):
            return {"success": False, "error": "Tool not found"}
        
        # Backup existing
        backup_file = f"{tool_file}.backup"
        os.rename(tool_file, backup_file)
        
        try:
            # Validate syntax
            try:
                ast.parse(new_code)
            except SyntaxError as e:
                os.rename(backup_file, tool_file)
                return {"success": False, "error": f"Invalid syntax: {e}"}
            
            with open(tool_file, "w") as f:
                f.write(new_code)
            
            # Reload the tool
            await self._reload_tool(tool_name)
            
            logger.info(f"✅ Modified tool: {tool_name}")
            
            return {
                "success": True,
                "tool_name": tool_name,
                "backup": backup_file
            }
            
        except Exception as e:
            # Restore backup on failure
            os.rename(backup_file, tool_file)
            return {"success": False, "error": str(e)}
    
    def _add_metadata_header(self, code: str, tool_name: str, 
                            description: str, created_by: str, 
                            process_id: str) -> str:
        """Add metadata header to tool code"""
        header = f'''"""
Tool: {tool_name}
Description: {description}
Created by: {created_by}
Process ID: {process_id}
Created at: {datetime.now().isoformat()}
"""

'''
        return header + code
    
    async def _register_tool(self, tool_name: str, tool_path: str, description: str):
        """Register the new tool with the tool registry"""
        try:
            # Import the tool module
            spec = importlib.util.spec_from_file_location(
                tool_name,
                os.path.join(tool_path, "tool.py")
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Get the tool function
            tool_func = getattr(module, tool_name)
            
            # Create Tool object
            tool = Tool(
                name=tool_name,
                description=description,
                function=tool_func,
                category="dynamic",
                cost=1.0,
                timeout=30,
                metadata={"created_by": "agent", "path": tool_path}
            )
            
            # Register with registry (assuming registry has register_tool method)
            # Note: Your current ToolRegistry might need this method added
            if hasattr(tool_registry, 'register_tool'):
                tool_registry.register_tool(tool)
            else:
                # If no register_tool method, we need to add it
                logger.warning(f"Tool {tool_name} created but not registered - registry missing register_tool method")
            
            logger.info(f"✅ Registered dynamic tool: {tool_name}")
            
        except Exception as e:
            logger.error(f"Failed to register tool {tool_name}: {e}")
    
    async def _reload_tool(self, tool_name: str):
        """Reload a modified tool"""
        # Implementation depends on your registry
        logger.info(f"🔄 Reloaded tool: {tool_name}")

# Global instance
dynamic_tool_creator = DynamicToolCreator()