from axr_core.process_manager.process import AIProcess

p = AIProcess(intent="secure repo", budget_limit=100)

print("PID:", p.pid)
print("State:", p.state)

p.start()
print("State after start:", p.state)

p.charge_budget(20)
print("Remaining budget:", p.remaining_budget())

p.terminate()
print("Final state:", p.state)