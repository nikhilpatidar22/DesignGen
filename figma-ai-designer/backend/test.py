from flask import Flask, request, jsonify
import google.generativeai as genai

# ----------------------------
# Hardcode your Gemini API key here
# ----------------------------
GOOGLE_API_KEY ="" # <--- Replace with your key

if not GOOGLE_API_KEY or GOOGLE_API_KEY.strip() == "":
    raise RuntimeError("⚠️ GOOGLE_API_KEY not set!")

genai.configure(api_key=GOOGLE_API_KEY)

# ----------------------------
# Flask setup
# ----------------------------
app = Flask(__name__)

# Simple ping endpoint to test key
@app.route("/ping", methods=["GET"])
def ping():
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Hello Gemini! Testing API key.")
        return jsonify({"ok": True, "reply": response.text})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})

# Start server
if __name__ == "__main__":
    app.run(port=4000, debug=True)
