# test_api.py
import requests
import json

base_url = "http://localhost:8000"

def test_api():
    print("🧪 Testing AXR API")
    print("="*50)
    
    # Test root endpoint
    print("\n📡 Testing root endpoint...")
    response = requests.get(f"{base_url}/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ API Version: {data['version']}")
        print(f"✅ Environment: {data['environment']}")
        print(f"✅ Agents Loaded: {data['agents_loaded']}")
        print(f"✅ Endpoints: {len(data['endpoints'])} available")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test health endpoint
    print("\n❤️ Testing health endpoint...")
    response = requests.get(f"{base_url}/health")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {data['status']}")
        print(f"✅ Agents: {data['agents']}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test dev agents lightweight
    print("\n🤖 Testing dev agents endpoint...")
    response = requests.get(f"{base_url}/dev/agents/lightweight")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {data['total']} agents")
        print(f"✅ Domains: {list(data['by_domain'].keys())}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Make sure dev routes are enabled (AXR_ENV=development)")
    
    # Test capability search
    print("\n🔍 Testing capability search...")
    response = requests.get(f"{base_url}/dev/agents/capabilities/search?query=code")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {data['matches']} agents with 'code' capability")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test test execution
    print("\n🎯 Testing mock execution...")
    response = requests.post(
        f"{base_url}/dev/agents/test",
        json={
            "goal": "Generate Python code for data analysis",
            "mock_mode": True,
            "mock_delay": 0.2
        }
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Test successful")
        print(f"✅ Mode: {data['mode']}")
        print(f"✅ Suitable agents: {len(data['suitable_agents'])}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    print("\n" + "="*50)
    print("✅ API test complete")

if __name__ == "__main__":
    test_api()