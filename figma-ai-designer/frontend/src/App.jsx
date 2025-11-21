import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import PromptPage from "./components/PromptPage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import DashboardPage from "./components/DashboardPage";
import LearnMore from "./components/LearnMore";
import bgImage from "./assets/bg.png";

const App = () => {
  const location = useLocation();

  // 🧠 Dynamic Page Titles
  useEffect(() => {
    const titles = {
      "/": "Figma MCP Generator",
      "/signin": "Sign In | Figma MCP",
      "/signup": "Sign Up | Figma MCP",
      "/dashboard": "Dashboard | Figma MCP",
    };
    document.title = titles[location.pathname] || "Figma MCP";
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 text-white"
    style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh"
          }}>
      <Header />

      <main className="grow">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/learnMore" element={<LearnMore />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <PromptPage />
                </SignedIn>

                <SignedOut>
                  <Navigate to="/signin" replace />
                </SignedOut>
              </>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
