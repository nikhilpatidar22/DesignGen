import React from "react";
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        className="shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >

        <SignedOut>
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
                  card: "bg-slate-900/80 text-white",
                },
              }}
              path="/signin"
              routing="path"
              signUpUrl="/signup"
              redirectUrl="/dashboard"
            />
          </div>
        </SignedOut>
      </motion.div>
    </div>
  );
};

export default SignInPage;
