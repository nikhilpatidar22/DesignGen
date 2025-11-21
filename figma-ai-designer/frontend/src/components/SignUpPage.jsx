import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, RedirectToSignIn, RedirectToUserProfile } from "@clerk/clerk-react";


const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        className="shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
                card: "bg-slate-900/80 text-white",
              },
            }}
            path="/signup"
            routing="path"
            signInUrl="/signin"
            redirectUrl="/dashboard"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
