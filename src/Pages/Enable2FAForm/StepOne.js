import { Button, TextField } from "@mui/material";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {  auth } from "../../firebase";


export default function StepOne({setStep}){

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);


    async function loginHandler(e){
        e.preventDefault();
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            // sessionStorage.setItem("sessionStart", Date.now());
            
            if(!userCredential.user.emailVerified){
                try{
                await sendEmailVerification(userCredential.user)
                toast.success("Verification email sent. Please verify and re-confirm here.")
            } catch(e){
                console.error(e)
            }
            } else {
                setStep(prev => prev + 1)
            }
            
          } catch (e) {
            toast.error(
                "Invalid Credentials."
              );
            console.error(e);
          } finally{
            setLoading(false);
          }
    }

    return(
        <form onSubmit={loginHandler}>
            <h5>Please confirm your login credentials</h5>

            <TextField 
            type="text"
            label="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{mt: 1, mb: 1}}
            />

            <TextField 
            label="Password" 
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 1}}
            />

            <Button variant="contained" disabled={loading} type="submit" fullWidth>{loading ? "Confirming" : "Confirm"}</Button>
        </form>
    )
}