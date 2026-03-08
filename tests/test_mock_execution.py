# tests/test_mock_execution.py
#!/usr/bin/env python3
"""
Test mock agent execution
Run with: python test_mock_execution.py
"""

import os
import sys
import asyncio
import json
import random

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.agents.base.agent import TaskContext

async def test_mock_agents():
    """Test mock agent execution"""
    print("\n" + "="*60)
    print("🧪 TESTING MOCK AGENT EXECUTION")
    print("="*60)
    
    # Find mock agents
    mock_agents = []
    for agent in agent_registry.get_all_agents():
        if agent.name.startswith('mock_'):
            mock_agents.append(agent)
    
    print(f"\n📊 Found {len(mock_agents)} mock agents:")
    for agent in mock_agents:
        print(f"  🤖 {agent.name} (domain: {agent.domain})")
    
    # Create a test context
    context = TaskContext("test-123", "Test execution", "test_user")
    
    # Test each mock agent
    print("\n🎯 Testing mock agents:")
    for agent in mock_agents:
        print(f"\n  Testing {agent.name}...")
        
        # Create a test task
        task = {
            "task_type": "execution",
            "goal": f"Test {agent.name}",
            "mock_delay": 0.1,
            "success_rate": 0.9
        }
        
        try:
            # Execute
            result = await agent.execute(task, context)
            
            # Check result
            if result.get("success"):
                print(f"    ✅ Success: {result.get('mock_output', 'No output')}")
            else:
                print(f"    ❌ Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    print("\n" + "✅"*30)
    print("✨ Mock test complete!")

if __name__ == "__main__":
    asyncio.run(test_mock_agents())