import requests
import time

BASE_URL = "http://localhost:4000"

def send_prompt(prompt_text):
    url = f"{BASE_URL}/mcp/figma"
    payload = {"prompt": prompt_text}
    try:
        resp = requests.post(url, json=payload)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def poll_next_command():
    url = f"{BASE_URL}/mcp/figma/next"
    try:
        resp = requests.get(url)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("🚀 MCP Frontend running. Type your instruction or 'exit' to quit.\n")
    while True:
        prompt = input("Enter design instruction: ")
        if prompt.lower() in ["exit", "quit"]:
            break

        # Send prompt to backend
        response = send_prompt(prompt)
        print("✅ Sent prompt:", response)

        # Poll for command (wait until backend has processed it)
        while True:
            command = poll_next_command()
            if command.get("status") == "no-command":
                print("⏳ Waiting for Gemini to generate command...")
                time.sleep(1)  # Wait 1 second
            else:
                print("🎨 Received command:", command)
                break

        print("\n---------------------------------\n")
