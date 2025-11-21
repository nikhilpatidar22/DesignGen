import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PenTool,
  Cpu,
  Palette,
  ArrowRight,
} from "lucide-react"; // icons

const LearnMore = () => {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-16">
      {/* 🌟 Hero Section */}
      <motion.div
        className="max-w-3xl text-center space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-4">
          Learn More About Figma MCP
        </h1>
        <p className="text-slate-200 text-lg md:text-xl leading-relaxed">
          Figma MCP is your creative co-pilot. Just describe what you want to
          build — and let our AI design structured, responsive Figma layouts in
          seconds. No more starting from scratch.
        </p>
      </motion.div>

      {/* 💡 How It Works */}
      <motion.div
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl w-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {[
          {
            icon: <PenTool className="w-10 h-10 text-indigo-400 mb-3" />,
            title: "Describe Your Idea",
            text: "Type what you imagine — a landing page, dashboard, or form — in natural language.",
          },
          {
            icon: <Cpu className="w-10 h-10 text-indigo-400 mb-3" />,
            title: "AI Builds Instantly",
            text: "Our intelligent model converts text into structured Figma layouts, components, and styling.",
          },
          {
            icon: <Palette className="w-10 h-10 text-indigo-400 mb-3" />,
            title: "Customize & Export",
            text: "Open the result directly in Figma, refine your design, and make it your own.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-gray-800/60 p-8 rounded-3xl shadow-lg hover:shadow-blue-500/20 transition-all text-center flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            {item.icon}
            <h3 className="text-xl md:text-2xl font-semibold text-indigo-400 mb-2">
              {item.title}
            </h3>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {item.text}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* 🚀 CTA Section */}
      <motion.div
        className="mt-24 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Design Smarter?
        </h2>
        <p className="text-slate-800 mb-8 text-base md:text-lg">
          Transform how you build. Figma MCP turns ideas into functional designs
          — instantly, intelligently, and beautifully.
        </p>
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 hover:scale-105 hover:shadow-xl transition-transform duration-300 text-white  shadow-md "
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
};

export default LearnMore;

// import React from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// const LearnMore = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col items-center justify-center px-6 py-12">
//       {/* 🌟 Hero Section */}
//       <motion.div
//         className="max-w-3xl text-center space-y-6"
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//       >
//         <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-4">
//           Learn More About Figma MCP
//         </h1>
//         <p className="text-slate-300 text-lg leading-relaxed">
//           Figma MCP is an AI-powered prompt-to-design tool that bridges your
//           imagination and Figma. With just a few lines of description, you can
//           generate fully structured Figma components — saving hours of manual
//           design work.
//         </p>
//       </motion.div>

//       {/* 💡 How It Works */}
//       <motion.div
//         className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl"
//         initial={{ opacity: 0 }}
//         whileInView={{ opacity: 1 }}
//         transition={{ duration: 0.6, delay: 0.2 }}
//         viewport={{ once: true }}
//       >
//         {[
//           {
//             title: "1️⃣ Describe Your Idea",
//             text: "Simply type what you want to design — a landing page, dashboard, or login form — in plain English.",
//           },
//           {
//             title: "2️⃣ Our AI Builds It",
//             text: "Figma MCP’s AI converts your text into responsive layouts and ready-to-use design components.",
//           },
//           {
//             title: "3️⃣ Export & Edit",
//             text: "Instantly open the result in Figma and tweak styles, text, or visuals with full design control.",
//           },
//         ].map((item, i) => (
//           <motion.div
//             key={i}
//             className="bg-slate-800/60 p-6 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all text-center"
//             whileHover={{ scale: 1.05 }}
//           >
//             <h3 className="text-xl font-semibold text-indigo-400 mb-2">
//               {item.title}
//             </h3>
//             <p className="text-slate-300 text-sm">{item.text}</p>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* 🚀 CTA Section */}
//       <motion.div
//         className="mt-16 text-center"
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         viewport={{ once: true }}
//       >
//         <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
//           Ready to Transform Your Design Workflow?
//         </h2>
//         <p className="text-slate-400 mb-6">
//           Get started and see how AI can bring your design ideas to life — in seconds.
//         </p>
//         <Link
//           to="/dashboard"
//           className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-indigo-500/30"
//         >
//           Get Started
//         </Link>
//       </motion.div>
//     </div>
//   );
// };

// export default LearnMore;
