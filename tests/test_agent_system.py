# tests/test_agent_system.py
#!/usr/bin/env python3
"""
Test script for AXR Agent System
Run with: python test_agent_system.py
"""

import os
import sys
import asyncio
import json
from datetime import datetime

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

print(f"📂 Project root: {project_root}")
print(f"🔧 Python path: {sys.path[0]}")

# Now import AXR modules
from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.agents.base.agent import TaskType

async def list_all_agents():
    """List all registered agents with their capabilities"""
    print("\n" + "="*60)
    print("📋 REGISTERED AGENTS")
    print("="*60)
    
    agents = agent_registry.get_all_agents()
    print(f"\n📊 Total agents: {len(agents)}")
    
    # Group by domain
    domains = {}
    for agent in agents:
        if agent.domain not in domains:
            domains[agent.domain] = []
        domains[agent.domain].append(agent.name)
    
    print("\n📌 Agents by Domain:")
    for domain, agent_list in sorted(domains.items()):
        print(f"  📍 {domain}: {', '.join(agent_list)}")
    
    # Show detailed capabilities for each agent
    print("\n🔧 Agent Capabilities:")
    for agent in agents[:5]:  # Show first 5 agents
        print(f"\n  🤖 {agent.name} (domain: {agent.domain})")
        print(f"     Capabilities: {', '.join(agent.capabilities[:3])}...")
        if hasattr(agent, 'task_types') and agent.task_types:
            task_types = [t.value if hasattr(t, 'value') else str(t) for t in agent.task_types]
            print(f"     Task types: {', '.join(task_types)}")
        print(f"     Rating: {getattr(agent, 'rating', 'N/A')}")

async def test_capability_search():
    """Test capability search functionality"""
    print("\n" + "="*60)
    print("🔍 TESTING CAPABILITY SEARCH")
    print("="*60)
    
    test_queries = ["code", "security", "scan", "email", "test"]
    
    for query in test_queries:
        matches = []
        agents = agent_registry.get_all_agents()
        
        for agent in agents:
            for capability in agent.capabilities:
                if query.lower() in capability.lower():
                    matches.append(f"{agent.name}.{capability}")
                    break
        
        print(f"\n  🔎 '{query}': {len(matches)} matches")
        if matches:
            print(f"     Examples: {', '.join(matches[:3])}")

async def test_agent_selection():
    """Test agent selection for different tasks"""
    print("\n" + "="*60)
    print("🎯 TESTING AGENT SELECTION")
    print("="*60)
    
    test_tasks = [
        {"goal": "Generate Python code for data analysis", "expected": "coding"},
        {"goal": "Scan repository for security vulnerabilities", "expected": "security"},
        {"goal": "Send email notification about build status", "expected": "communication"},
        {"goal": "Create a dashboard for system metrics", "expected": "visualization"},
        {"goal": "Setup CI/CD pipeline for deployment", "expected": "automation"}
    ]
    
    agents = agent_registry.get_all_agents()
    
    for task in test_tasks:
        print(f"\n  📋 Task: {task['goal']}")
        
        # Find matching agents
        matches = []
        for agent in agents:
            score = 0
            goal_lower = task['goal'].lower()
            
            # Check capabilities
            for capability in agent.capabilities:
                if any(word in goal_lower for word in capability.split('_')):
                    score += 1
            
            if score > 0:
                matches.append((score, agent.name, agent.domain))
        
        matches.sort(reverse=True)
        
        print(f"     Best match: {matches[0][1]} (domain: {matches[0][2]})" if matches else "     No matches found")
        print(f"     Total matches: {len(matches)}")

async def main():
    """Main test function"""
    print("\n" + "🚀"*30)
    print("🧪 AXR AGENT SYSTEM TEST SUITE")
    print("🚀"*30)
    
    # Run all tests
    await list_all_agents()
    await test_capability_search()
    await test_agent_selection()
    
    print("\n" + "✅"*30)
    print("✨ All tests completed successfully!")
    print("✅"*30)

if __name__ == "__main__":
    asyncio.run(main())