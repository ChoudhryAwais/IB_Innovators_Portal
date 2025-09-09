import { Button, TextField } from "@mui/material";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { auth } from "../../firebase";

export default function StepOne({ setStep }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginHandler(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        try {
          await sendEmailVerification(userCredential.user);
          toast.success("Verification email sent. Please verify and re-confirm here.");
        } catch (e) {
          console.error(e);
        }
      } else {
        setStep((prev) => prev + 1);
      }
    } catch (e) {
      toast.error("Invalid Credentials.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={loginHandler}
      className="flex flex-col gap-4 p-4 bg-white/50 backdrop-blur-md rounded-md shadow-md"
    >
      <h5 className="text-lg font-semibold">Please confirm your login credentials</h5>

      <TextField
        type="text"
        label="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />

      <TextField
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
        className="mt-2"
      >
        {loading ? "Confirming" : "Confirm"}
      </Button>
    </form>
  );
}
