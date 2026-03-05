import asyncio
from axr_core.agents.service.agent_system import initialize_agent_system


async def main():

    runner = initialize_agent_system()

    result = await runner.run(
        domain="cybersecurity",
        capability="vulnerability_scan",
        task={"target": "example.com"}
    )

    print(result)


asyncio.run(main())