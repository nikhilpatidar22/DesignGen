from flask import Flask, request, jsonify
from flask_cors import CORS
import queue
import re

app = Flask(__name__)
CORS(app)  # allow frontend to fetch

# Simple command queue
command_queue = queue.Queue()

# Simulate Gemini AI conversion
def convert_prompt_to_command(prompt):
    prompt_lower = prompt.lower()
    
    # Default values
    width = 200
    height = 100
    color = "#0000FF"  # default blue
    text = ""
    fontSize = 24
    shape_type = "rectangle"

    # Extract color in hex (#xxxxxx)
    color_match = re.search(r"#([0-9a-fA-F]{6})", prompt)
    if color_match:
        color = "#" + color_match.group(1)

    # Extract width
    width_match = re.search(r"width (\d+)", prompt_lower)
    if width_match:
        width = int(width_match.group(1))

    # Extract height
    height_match = re.search(r"height (\d+)", prompt_lower)
    if height_match:
        height = int(height_match.group(1))

    # Extract text inside quotes
    text_match = re.search(r"'(.*?)'", prompt)
    if text_match:
        text = text_match.group(1)

    # Detect type
    if "circle" in prompt_lower:
        shape_type = "circle"
    elif "text" in prompt_lower:
        shape_type = "text"
        font_match = re.search(r"font size (\d+)", prompt_lower)
        if font_match:
            fontSize = int(font_match.group(1))

    # Build command
    if shape_type == "rectangle":
        return {"type": "rectangle", "width": width, "height": height, "color": color, "text": text, "fontSize": fontSize}
    elif shape_type == "circle":
        return {"type": "circle", "width": width, "height": height, "color": color}
    else:  # text
        return {"type": "text", "text": text, "fontSize": fontSize}

# Endpoint to receive prompt
@app.route("/mcp/figma", methods=["POST"])
def mcp_figma():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"status": "error", "msg": "Prompt missing"})
    
    command = convert_prompt_to_command(prompt)
    command_queue.put(command)
    return jsonify({"status": "ok", "queued_command": command})

# Endpoint for Figma plugin to get next command
@app.route("/mcp/figma/next", methods=["GET"])
def mcp_next():
    if command_queue.empty():
        return jsonify({"status": "no-command"})
    cmd = command_queue.get()
    return jsonify(cmd)

if __name__ == "__main__":
    print("🚀 MCP Backend running at http://127.0.0.1:4000")
    app.run(host="127.0.0.1", port=4000)
