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


import json
load_dotenv()

<<<<<<< HEAD
# Get API key from environment
# api_key = os.getenv("GOOGLE_API")
# if not api_key:
#     raise RuntimeError(" GOOGLE_API_KEY not found in environment")

# Initialize Gemini client with API key
# client = Client(api_key=api_key)
# print(api_key)
=======
# Initialize Flask App
>>>>>>> 1edad5d5d8f8dcd57339061dc507e7c941466295
app = Flask(__name__)
CORS(app)

# In-memory queue (Note: For production, use Redis)
command_queue = queue.Queue()
api_key=os.getenv("GROQ_API_KEY")
print(api_key)

# api_key=os.getenv("OPENAI_API_KEY")


# client = OpenAI(api_key=api_key)

# print(api_key)



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
<<<<<<< HEAD
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


=======
        client = get_groq_client()
>>>>>>> 1edad5d5d8f8dcd57339061dc507e7c941466295
        
        # Construct the full prompt
        full_instruction = SYSTEM_PROMPT_TEMPLATE.replace("{prompt}", user_prompt)

<<<<<<< HEAD
        # response = client.models.generate_content(
        #     model="gemini-2.5-flash",
        #     contents=instruction
        # )
        
        response = Groq(
        api_key=api_key,
        )
        

        chat_completion= response.chat.completions.create(
=======
        print(f"📩 Full Instruction: {full_instruction}")

        chat_completion = client.chat.completions.create(
>>>>>>> 1edad5d5d8f8dcd57339061dc507e7c941466295
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
        # gemini_response = client.models.generate_content(
        #     model="gemini-2.0-flash",
        #     contents=instruction
        # )

<<<<<<< HEAD
        generated_text = chat_completion.text
        print("Generated Text:", generated_text)

        generated_text = re.sub(r"^```json\s*|\s*```$", "", generated_text, flags=re.MULTILINE)

        command_list = json.loads(generated_text)

=======
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
            
>>>>>>> 1edad5d5d8f8dcd57339061dc507e7c941466295
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
