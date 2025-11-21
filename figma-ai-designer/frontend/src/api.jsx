import axios from "axios";

// Use your Vite environment variable for backend URL
const API_URL = import.meta.env.VITE_API_URL;

// Send prompt to backend
export const sendPrompt = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/mcp/figma`, { prompt });
    return response.data; // {status: "ok", queued_count: N}
  } catch (err) {
    console.error("Error sending prompt:", err);
    return null;
  }
};

// Get next command from backend
export const getNextCommand = async () => {
  try {
    const response = await axios.get(`${API_URL}/mcp/figma/next`);
    return response.data; // command object or {status: "no-command"}
  } catch (err) {
    console.error("Error fetching next command:", err);
    return null;
  }
};
