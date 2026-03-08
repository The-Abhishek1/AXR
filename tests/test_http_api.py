# tests/test_http_api.py
#!/usr/bin/env python3
"""
Test HTTP API endpoints
Run with: python test_http_api.py
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def print_response(label, response):
    """Print formatted response"""
    print(f"\n{label}:")
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and len(data) > 0:
            # Pretty print first few keys
            if "total" in data:
                print(f"  Total: {data['total']}")
            if "agents" in data:
                print(f"  Agents: {len(data['agents'])}")
            print(f"  Response keys: {list(data.keys())[:5]}")
    else:
        print(f"  Error: {response.text}")

def test_endpoints():
    """Test all API endpoints"""
    print("\n" + "="*60)
    print("🌐 TESTING HTTP API ENDPOINTS")
    print("="*60)
    
    endpoints = [
        ("GET", "/"),
        ("GET", "/health"),
        ("GET", "/agents"),
        ("GET", "/dev/agents/lightweight"),
        ("GET", "/dev/agents/domains"),
        ("GET", "/dev/agents/stats"),
        ("GET", "/enhanced/agents/capabilities"),
        ("GET", "/tools"),
        ("GET", "/workers"),
        ("GET", "/processes"),
    ]
    
    for method, endpoint in endpoints:
        url = f"{BASE_URL}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
                print_response(f"📡 {method} {endpoint}", response)
            elif method == "POST":
                # Skip POST for now
                pass
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to {BASE_URL}")
            print("   Make sure the server is running with: uvicorn api.app:app --host 0.0.0.0 --reload")
            return False
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {e}")
    
    # Test search endpoint
    try:
        response = requests.get(f"{BASE_URL}/dev/agents/capabilities/search?query=code")
        print_response("🔍 GET /dev/agents/capabilities/search?query=code", response)
    except Exception as e:
        print(f"❌ Error testing search: {e}")
    
    # Test mock execution
    try:
        payload = {
            "goal": "Generate Python code for data analysis",
            "mock_mode": True,
            "mock_delay": 0.2
        }
        response = requests.post(f"{BASE_URL}/dev/agents/test", json=payload)
        print_response("🎯 POST /dev/agents/test", response)
    except Exception as e:
        print(f"❌ Error testing mock execution: {e}")
    
    print("\n" + "✅"*30)
    print("✨ HTTP API test complete!")
    return True

if __name__ == "__main__":
    # Check if server is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
        print(f"✅ Server is running at {BASE_URL}")
    except:
        print(f"❌ Server is not running at {BASE_URL}")
        print("   Start it with: uvicorn api.app:app --host 0.0.0.0 --reload")
        sys.exit(1)
    
    test_endpoints()