import React, { useState, useEffect, useContext } from "react";

import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  multiFactor,
} from "firebase/auth";
import { Button, TextField } from "@mui/material";
import { DisplayInfo } from "../../Components/DisplayInfo/DisplayInfo";
import { useNavigate } from "react-router-dom";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

import { MuiOtpInput } from "mui-one-time-password-input";

export function Enable2FAForm() {
  const { userDetails } = useContext(MyContext);
  const [step, setStep] = useState(1);
  const [savingDetails, setSavingDetails] = useState(false);
  async function savingChanges() {
    setSavingDetails(true);
    try {
      const details = {
        TFAEnabled: true,
      };

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userDetails.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        // Update only the specified fields in the document
        await updateDoc(docRef, details);
      }
    } catch (e) {
      toast.error("Error saving changes. Please try again");
    } finally {
      setSavingDetails(false);
    }
  }

  //   _________________________________________________

  const [verification, setverification] = useState(null);
  const [sendingOtp, setSendingOTP] = useState(false);
  const [otp, setOtp] = useState(null);

  const handleChange = (e) => {
    setOtp(e.target.value);
  };


  const verifyotp = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      //get the OTP from user nad pass in PhoneAuthProvider
      const cred = PhoneAuthProvider.credential(verification, otp);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      const user = auth.currentUser;
      /* Enrolling the user in the multi-factor authentication. */
      await multiFactor(user)
        .enroll(multiFactorAssertion, userDetails.phone)
        .then((enrollment) => {
          toast.success("2FA Enabled");
          savingChanges();
        });
    } catch (err) {
      toast.error("Invalid OTP");
      console.error(err);
    }
  };

  return (
    <div
    className="shadowAndBorder"
    style={{
      height: "max-content",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
      background: "rgba(255,255,255, 0.5)",
      backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
      WebkitBackdropFilter: "blur(4px)", // For Safari support,
      padding: "10px",
      borderRadius: "10px",
      marginBottom: '10px'
    }}
    >
      <div
        className="backgroundBlue"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            textAlign: "left",
          }}
        >
          Enable 2-Factor Authentication
        </h2>

        {/* <Button onClick={() => setShow2FAModal(false)} color="error" variant="outlined">Cancel</Button> */}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "5px",
            background: step >= 1 ? "green" : "#ccc",
          }}
        ></div>

        <div
          style={{
            flex: 1,
            height: "5px",
            background: step >= 2 ? "green" : "#ccc",
          }}
        ></div>

        <div
          style={{
            flex: 1,
            height: "5px",
            background: step >= 3 ? "green" : "#ccc",
          }}
        ></div>
      </div>

      {step === 1 && <StepOne setStep={setStep} />}

      {step === 2 && <StepTwo setStep={setStep} setverification={setverification} />}

      {step === 3 && (
        <div style={{ padding: "10px", flex: 1 }}>
          <>
            <TextField
              type="text"
              label="Enter OTP"
              value={otp}
              onChange={handleChange}
              fullWidth
              sx={{mb: 1}}
            />
            <Button
              style={{ width: "100%", marginTop: "10px" }}
              disabled={userDetails?.TFAEnabled}
              onClick={verifyotp}
              variant="contained"
            >
              {savingDetails ? "Verifying" : "Verify"}
            </Button>
          </>
        </div>
      )}
    </div>
  );
}
