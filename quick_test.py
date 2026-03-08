# quick_test.py
#!/usr/bin/env python3
"""
Quick test script for agent system
Run with: python quick_test.py
"""

import asyncio
import sys
from axr_core.agents.registry.agent_registry import agent_registry

async def quick_test():
    print("🔍 Testing AXR Agent System")
    print("="*50)
    
    # Check registered agents
    agents = agent_registry.get_all_agents()
    print(f"📊 Found {len(agents)} registered agents")
    
    # Group by domain
    domains = {}
    for agent in agents:
        if agent.domain not in domains:
            domains[agent.domain] = []
        domains[agent.domain].append(agent.name)
    
    print("\n📋 Agents by Domain:")
    for domain, agent_list in domains.items():
        print(f"  📌 {domain}: {', '.join(agent_list)}")
    
    # Test capability search
    print("\n🔎 Testing capability search...")
    test_queries = ["code", "security", "scan", "email"]
    
    for query in test_queries:
        matches = []
        for agent in agents:
            for cap in agent.capabilities:
                if query in cap.lower():
                    matches.append(f"{agent.name}.{cap}")
                    break
        
        print(f"  '{query}': {len(matches)} matches - {', '.join(matches[:3])}")
    
    print("\n✅ System ready for development")
    print("="*50)
    print("Next steps:")
    print("1. Add more agents to axr_core/agents/domains/")
    print("2. Test with: curl http://localhost:8000/dev/agents/test")
    print("3. View agents: curl http://localhost:8000/dev/agents/lightweight")

if __name__ == "__main__":
    asyncio.run(quick_test())