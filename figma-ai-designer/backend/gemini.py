from flask import Flask, request, jsonify
from flask_cors import CORS
import queue
import os
from google.genai import Client
from dotenv import load_dotenv
import json
import ast
import re

load_dotenv()

# Get API key from environment
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError(" GOOGLE_API_KEY not found in environment")

# Initialize Gemini client with API key
client = Client(api_key=api_key)

app = Flask(__name__)
CORS(app)

command_queue = queue.Queue()

# Convert prompt to Figma commands using Gemini
def convert_prompt_to_command(prompt):
    try:
        instruction = f"""
            Convert the following prompt into a JSON array of Figma elements.

            🎨 Design Principles (must be followed):
            - Always create a top-level "Page" frame (width: 1440px, height: auto).
            - Inside the Page, create section frames in vertical flow:
            - Header
            - Hero
            - Content Sections (Features, Pricing, Testimonials, etc.)
            - Footer
            - Background:
            - Use a single background color (#F9FAFB) for the Page frame.
            - Section backgrounds should either be transparent or subtle variations (#FFFFFF, #F3F4F6).
            - No abrupt color breaks unless explicitly requested.
            - Spacing:
            - Follow an 8px spacing system.
            - Add padding inside frames (top/bottom at least 80px per section).
            - Keep consistent margins (content max width 1200px, centered).
            - Typography System:
            - H1: 48px, bold
            - H2: 32px, semi-bold
            - Body: 16px, regular
            - Buttons: 18px, bold
            - Components:
            - Buttons: rectangle + centered text, with cornerRadius=8, shadow, primary color (#2563EB).
            - Cards: rectangle with rounded corners, shadow, padding, include text + image.
            - Inputs: light background (#F3F4F6), border radius 6px, left-aligned placeholder text.
            - Consistency:
            - Use the same font family everywhere (Inter).
            - Align elements using frame grids (never place randomly).
            - Ensure vertical rhythm: 40px–60px spacing between sections.

            ⚙️ JSON Requirements:
            Each element must include:
            - type: one of ["frame","rectangle","circle","text","image","line","ellipse","polygon","star","vector","boolean","component","instance"]
            - x, y (absolute position)
            - width, height
            - color (hex, optional for text/images)
            - text (only for type="text")
            - fontSize, fontFamily, textAlign (if type="text")
            - optional: name (for grouping: "Header", "Hero", "Button", "Card", etc.)
            - optional: cornerRadius, stroke, shadow, opacity, padding, layoutAlign

            Respond only with valid JSON. Do not include explanations or code blocks.

            Prompt: {prompt}
        """


        

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=instruction
        )
       
        generated_text = response.text.strip()

        # Remove ```json and ``` if present
        generated_text = re.sub(r"^```json\s*|\s*```$", "", generated_text, flags=re.MULTILINE)

        # Then parse JSON safely
        command_list = json.loads(generated_text)

        # print("Gemini raw response:", repr(generated_text))

        # First try safe Python literal eval (handles single quotes/lists)
        try:
            command_list = ast.literal_eval(generated_text)
        except Exception:
            command_list = json.loads(generated_text)

        # Ensure it’s always a list
        if isinstance(command_list, dict):
            command_list = [command_list]
        # print(command_list)
        return command_list

    except Exception as e:
        print("Error in Gemini API:", e)
        # fallback: return default rectangle
        return [{"type": "rectangle", "width": 200, "height": 100, "color": "#0000FF", "text": "Sign Up"}]


# Receive prompt from frontend
@app.route("/mcp/figma", methods=["POST"])
def mcp_figma():
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"status": "error", "msg": "Prompt missing"})

    commands = convert_prompt_to_command(prompt)

    # Add each command separately to the queue so Figma plugin can process one at a time
    for cmd in commands:
        command_queue.put(cmd)

    return jsonify({"status": "ok", "queued_count": len(commands)})


# Figma plugin polls this endpoint
@app.route("/mcp/figma/next", methods=["GET"])
def mcp_next():
    if command_queue.empty():
        return jsonify({"status": "no-command"})
    cmd = command_queue.get()
    return jsonify(cmd)


if __name__ == "__main__":
    print("🚀 MCP Backend with Gemini running at http://127.0.0.1:4000")
    app.run(host="127.0.0.1", port=4000)
