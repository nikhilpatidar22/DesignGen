import requests
import json
import time

url = "http://127.0.0.1:4000/mcp/figma"
prompt = "Create a blue rectangle named 'Test Rect' with text 'Hello World' inside it."

payload = {"prompt": prompt}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending prompt: {prompt}")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Wait a bit for processing if needed, though the response usually indicates queued
    time.sleep(2)
    
    # Check next command
    next_url = "http://127.0.0.1:4000/mcp/figma/next"
    next_response = requests.get(next_url)
    print(f"Next Command: {json.dumps(next_response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")
