import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Menu, X, LayoutDashboard, Home, LogIn, UserPlus } from "lucide-react";

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="w-full sticky top-0 z-50 bg-black-300/70 backdrop-blur-md "
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* 🌟 Logo */}
        <Link
          to="/"
          className="text-2xl font-light tracking-wide text-white-400 hover:text-indigo-300 transition-all"
        >
          <span className="font-semibold text-orange-400/90">Figma</span> MCP
        </Link>

        {/* 🌐 Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-light text-slate-300">
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-indigo-400 transition-colors duration-200"
          >
            <Home className="w-4 h-4" /> Home
          </Link>

          <SignedIn>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:text-indigo-400 transition-colors duration-200"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <div className="ml-5">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4">
              <Link
                to="/signin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-400/20 text-gray-200 hover:bg-gray-600/60 font-medium transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-300 text-black font-medium transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </div>
          </SignedOut>
        </nav>

        {/* 📱 Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-slate-300" />
          ) : (
            <Menu className="w-6 h-6 text-slate-300" />
          )}
        </button>
      </div>

      {/* 📱 Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 space-y-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className="flex py-2 text-slate-300 hover:text-indigo-400 transition-colors items-center justify-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <Home className="w-4 h-4" /> Home
            </Link>

            <SignedIn>
              <Link
                to="/dashboard"
                className="flex py-2 text-slate-300 hover:text-indigo-400 transition-colors items-center justify-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <div className="flex justify-center mt-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex flex-col gap-3 items-center mt-4">
                <Link
                  to="/signin"
                  className="w-full py-2 rounded-xl border border-indigo-500/60 text-indigo-400 hover:bg-indigo-600/10 transition-all flex items-center justify-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  to="/signup"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </Link>
              </div>
            </SignedOut>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
