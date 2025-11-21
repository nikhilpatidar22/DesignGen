import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
// import bgImage from "../assets/bg.png";
import { sendPrompt, getNextCommand } from "../api";


const PromptPage = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);


  const stages = ["Analyzing prompt", "Generating design", "Finalizing output"];

  // const handleCreate = async () => {
  //   if (!prompt.trim()) return;
  //   setLoading(true);
  //   setResult(null);
  //   setError(null);
  //   setStage(stages[0]);

  //   try {
  //     for (let i = 0; i < stages.length; i++) {
  //       setStage(stages[i]);
  //       await new Promise((res) => setTimeout(res, 4000));
  //     }

  //     // Yaha MCP ka API call aayega
  //     await new Promise((res) => setTimeout(res, 1000));

  //     setResult("Successfully generated Check your Figma !!");
  //   } catch (err) {
  //     setError("Something went wrong while generating content.");
  //   } finally {
  //     setLoading(false);
  //     setStage("");
  //     // setPrompt("");
  //   }
  // };

  const handleCreate = async () => {
  if (!prompt.trim()) return;
  setLoading(true);
  setResult(null);
  setError(null);
  setStage(stages[0]);

  

  try {
    // Stage animations
    for (let i = 0; i < stages.length; i++) {
      setStage(stages[i]);
      await new Promise((res) => setTimeout(res, 1500)); // stage delay
    }

    // 🔗 Call backend
    const response = await sendPrompt(prompt);

    if (response?.status === "ok") {
      setResult(`Successfully queued ${response.queued_count} Figma commands!`);
      setError(null);
    } else {
      setResult(null);
      setError("Failed to send prompt to backend.");
    }
  } catch (err) {
    console.error(err);
    setResult(null);
    setError("Something went wrong while generating content.");
  } finally {
    setLoading(false);
    setStage("");
  }
};








  return (
    <div className="min-h-screen flex flex-col items-center justify-center  text-white px-4"
    >
      <motion.h1
        className="text-4xl font-bold mb-6 flex items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="text-yellow-400" /> Figma MCP Generator
      </motion.h1>

      <motion.div
        className="bg-slate-800/50 p-6 rounded-2xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <textarea
          className="w-full h-32 p-3 rounded-lg bg-gray-900 border border-slate-900/50 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
          placeholder="Enter your creative prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 hover:scale-105 hover:shadow-xl text-xl transition-transform duration-300 "
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> Working...
            </div>
          ) : (
            "Create"
          )}
        </button>

        
        {/*Loading animations for stages */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key={stage}
              className="mt-6 text-center text-slate-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-lg font-medium">{stage}...</div>
              <motion.div
                className="mt-4 flex justify-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*result */}
        {result && (
          <motion.div
            className="mt-6 bg-slate-700/50 p-4 rounded-lg text-center flex items-center justify-center gap-2 text-green-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 /> {result}
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mt-6 bg-red-500/20 p-4 rounded-lg text-center flex items-center justify-center gap-2 text-red-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle /> {error}
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

export default PromptPage;
