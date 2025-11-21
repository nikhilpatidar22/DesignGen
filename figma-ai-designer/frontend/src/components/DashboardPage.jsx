import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center  text-white">
      <motion.div
        className="max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-6xl md:text-6xl font-extrabold text-shadow-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-orange-400/90">Figma MCP</span> — Design Smarter, Faster, and Better
        </motion.h1>

        <motion.p
          className="text-slate-900 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Figma MCP is an AI-powered prompt-to-design generator that transforms your ideas into 
          production-ready Figma layouts — instantly. No more manual designing, just creativity and automation.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
        <Link to={"/dashboard"}>
          <button className="px-6 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 hover:scale-105 hover:shadow-xl transition-transform duration-300 flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5" /> Start Creating
          </button></Link>
          <Link to={"/learnMore"}>
          <button className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 backdrop-blur-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5" /> Learn More
          </button></Link>
        </motion.div>
      </motion.div>

  
    </div>
  );
};

export default DashboardPage;
