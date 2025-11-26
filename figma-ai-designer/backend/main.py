from flask import Flask, request, jsonify
from flask_cors import CORS
import queue
import os
from google.genai import Client
from dotenv import load_dotenv
import json
import ast
import re
from groq import Groq


import json
load_dotenv()

# Get API key from environment
# api_key = os.getenv("GOOGLE_API")
# if not api_key:
#     raise RuntimeError(" GOOGLE_API_KEY not found in environment")

# Initialize Gemini client with API key
# client = Client(api_key=api_key)
# print(api_key)
app = Flask(__name__)
CORS(app)

command_queue = queue.Queue()
api_key=os.getenv("GROQ_API_KEY")
print(api_key)

# api_key=os.getenv("OPENAI_API_KEY")


# client = OpenAI(api_key=api_key)

# print(api_key)



# Convert prompt to Figma commands using Gemini
def convert_prompt_to_command(prompt):
    try:
        instruction = """
           
           You are an expert Figma designer. Your task is to convert user prompts into valid JSON arrays of Figma design elements.

            # CRITICAL RULES
            1. Output ONLY a valid JSON array - no explanations, no markdown, no code blocks
            2. Every element MUST have: type, x, y, width, height
            3. Use rich colors - NO gray wireframes
            4. Add cornerRadius to ALL buttons and cards
            5. Ensure proper visual hierarchy with spacing

            # ELEMENT TYPES
            - "frame" - containers
            - "rectangle" - boxes, buttons, cards
            - "text" - all text content
            - "ellipse" - circles, icons

            # DESIGN SYSTEM

            ## Layout
            - Page width: 1440px
            - Content max-width: 1200px (centered at x: 120)
            - Use 8px spacing grid: 8, 16, 24, 32, 48, 64, 80

            ## Colors (USE THESE)
            - Page Background: #F9FAFB
            - White: #FFFFFF
            - Primary Blue: #3B82F6
            - Primary Indigo: #6366F1
            - Text Dark: #111827
            - Text Gray: #6B7280
            - Accent Purple: #8B5CF6

            ## Typography
            - Headings: fontSize 48-64, fontWeight "Bold", color "#111827"
            - Subheadings: fontSize 24-32, fontWeight "SemiBold", color "#374151"
            - Body: fontSize 16-18, fontWeight "Regular", color "#6B7280"
            - Buttons: fontSize 16, fontWeight "SemiBold", color "#FFFFFF"

            ## Components

            ### Buttons
            ALWAYS include:
            - Rectangle with color "#3B82F6" or "#6366F1"
            - cornerRadius: 12 (for rounded) or 28 (for pill)
            - Text overlay with color "#FFFFFF"

            ### Cards
            ALWAYS include:
            - Rectangle with color "#FFFFFF"
            - cornerRadius: 20
            - Add shadow property (optional but recommended)

            ### Sections
            - Header: height 80px, color "#FFFFFF"
            - Hero: height 600-700px, color "#EEF2FF" or gradient
            - Content sections: padding 80px top/bottom



            # EXAMPLE OUTPUT

            [
            {"type":"frame","name":"Page","x":0,"y":0,"width":1440,"height":2000,"color":"#F9FAFB"},
            {"type":"rectangle","name":"Header","x":0,"y":0,"width":1440,"height":80,"color":"#FFFFFF"},
            {"type":"text","name":"Logo","x":120,"y":28,"text":"Brand","fontSize":24,"fontWeight":"Bold","color":"#111827"},
            {"type":"rectangle","name":"Hero BG","x":0,"y":80,"width":1440,"height":600,"color":"#EEF2FF"},
            {"type":"text","name":"Hero Title","x":120,"y":220,"width":700,"text":"Welcome to Our Product","fontSize":56,"fontWeight":"Bold","color":"#111827"},
            {"type":"text","name":"Hero Subtitle","x":120,"y":300,"width":600,"text":"Build amazing things faster","fontSize":20,"fontWeight":"Regular","color":"#6B7280"},
            {"type":"rectangle","name":"CTA Button","x":120,"y":380,"width":160,"height":56,"color":"#3B82F6","cornerRadius":28},
            {"type":"text","name":"CTA Text","x":155,"y":398,"text":"Get Started","fontSize":16,"fontWeight":"SemiBold","color":"#FFFFFF"},
            {"type":"rectangle","name":"Feature Card","x":120,"y":750,"width":360,"height":300,"color":"#FFFFFF","cornerRadius":20},
            {"type":"text","name":"Card Title","x":160,"y":810,"text":"Fast Performance","fontSize":24,"fontWeight":"Bold","color":"#111827"},
            {"type":"text","name":"Card Description","x":160,"y":860,"width":280,"text":"Lightning fast load times and smooth interactions","fontSize":16,"fontWeight":"Regular","color":"#6B7280"}
            ]

            # YOUR TASK
            Convert this prompt into the JSON format above: {prompt}

            Remember: Output ONLY the JSON array, nothing else.
            # Respond only with valid JSON. Do not include explanations or code blocks.


            Prompt: {prompt}

            
        """


        

        # response = client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=instruction
        # )
        
        response = Groq(
        api_key=api_key,
        )
        

        chat_completion= response.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": instruction,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        # gemini_response = client.models.generate_content(
        #     model="gemini-2.0-flash",
        #     contents=instruction
        # )

        generated_text = chat_completion.text
        print("Generated Text:", generated_text)

        generated_text = re.sub(r"^```json\s*|\s*```$", "", generated_text, flags=re.MULTILINE)

        command_list = json.loads(generated_text)

        return command_list

    #     response = client.responses.create(
    #     model="gpt-4o-mini",   # or gpt-5.1, gpt-4.1, gpt-4o, etc.
    #     input=instruction
    # )

        # generated_text = response.output_text
        #     # --------------------------------

        #     # Clean ```json
        # generated_text = re.sub(r"^```json\s*|\s*```$", "", generated_text, flags=re.MULTILINE)

        #     # Parse JSON
        # command_list = json.loads(generated_text)

        # return command_list


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
