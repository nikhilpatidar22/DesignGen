from flask import Flask, request, jsonify
from flask_cors import CORS
import queue
import os
from dotenv import load_dotenv
import json
import ast
import re
from groq import Groq
from mistralai import Mistral

load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# In-memory queue (Note: For production, use Redis)
command_queue = queue.Queue()

# Load System Prompt
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "prompts", "system_prompt.txt")
try:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        SYSTEM_PROMPT_TEMPLATE = f.read()
except FileNotFoundError:
    print(f"⚠️ Warning: System prompt not found at {PROMPT_PATH}. Using default.")
    SYSTEM_PROMPT_TEMPLATE = "You are a design assistant. Convert prompt to JSON Figma elements."

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)

def convert_prompt_to_command(user_prompt):
    try:
        client = get_groq_client()
        
        # Construct the full prompt
        full_instruction = SYSTEM_PROMPT_TEMPLATE.replace("{prompt}", user_prompt)

        print(f"📩 Full Instruction: {full_instruction}")

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON generator. Output only valid JSON array. No markdown, no explanations."
                },
                {
                    "role": "user",
                    "content": full_instruction,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5, # Lower temperature for more deterministic JSON
        )
       
        generated_text = chat_completion.choices[0].message.content

        with open("output.txt", "w", encoding="utf-8") as f:
            f.write(generated_text)

        print(f"🤖 AI Response: {generated_text[:100]}...") # Log first 100 chars

        # Clean up response (remove markdown code blocks if present)
        cleaned_text = re.sub(r"^```json\s*|\s*```$", "", generated_text.strip(), flags=re.MULTILINE)

        # Parse JSON
        try:
            command_list = json.loads(cleaned_text)
        except json.JSONDecodeError:
            # Fallback: try ast.literal_eval for single-quote JSON variants
            command_list = ast.literal_eval(cleaned_text)

        # Ensure it's a list
        if isinstance(command_list, dict):
            command_list = [command_list]
            
        return command_list

    except Exception as e:
        print(f"❌ Error generating design: {str(e)}")
        # Return a safe fallback to prevent frontend crash
        return [{
            "type": "text", 
            "x": 100, 
            "y": 100, 
            "text": f"Error: {str(e)}", 
            "fontSize": 24, 
            "color": "#FF0000"
        }]

@app.route("/mcp/figma", methods=["POST"])
def mcp_figma():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"status": "error", "msg": "Prompt missing"}), 400

    print(f"📩 Received prompt: {prompt}")
    commands = convert_prompt_to_command(prompt)

    # Add to queue
    for cmd in commands:
        command_queue.put(cmd)

    return jsonify({"status": "ok", "queued_count": len(commands)})

@app.route("/mcp/figma/next", methods=["GET"])
def mcp_next():
    if command_queue.empty():
        return jsonify({"status": "no-command"})
    cmd = command_queue.get()
    return jsonify(cmd)

if __name__ == "__main__":
    print("🚀 DesignGen Backend running at http://127.0.0.1:4000")
    app.run(host="127.0.0.1", port=4000, debug=True)
