import React, { useState } from "react";

export default function App() {
  const [instruction, setInstruction] = useState("");
  const [lastCmd, setLastCmd] = useState(null);
  const [status, setStatus] = useState("");

  async function send() {
    setStatus("sending...");
    try {
      const resp = await fetch("http://localhost:4000/mcp/figma/create", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ instruction })
      });
      const data = await resp.json();
      setLastCmd(data.command);
      setStatus("queued");
    } catch (e) {
      setStatus("error: " + e.message);
    }
  }

  return (
    <div style={{maxWidth:720, margin:"2rem auto", fontFamily:"sans-serif"}}>
      <h1>Figma AI Designer</h1>
      <p>Type something like: <em>Create a large blue login button with text 'Sign In'</em></p>
      <textarea
        value={instruction}
        onChange={e => setInstruction(e.target.value)}
        rows={4}
        style={{width:"100%", padding:12}}
      />
      <div style={{marginTop:12}}>
        <button onClick={send} style={{padding:"10px 16px"}}>Send to Figma</button>
        <span style={{marginLeft:12}}>{status}</span>
      </div>

      {lastCmd && (
        <div style={{marginTop:18}}>
          <h3>Last JSON command</h3>
          <pre style={{background:"#f7f7f7", padding:12}}>{JSON.stringify(lastCmd,null,2)}</pre>
        </div>
      )}
    </div>
  );
}
