import React, { useState, useContext } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import { PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor } from "firebase/auth";
import { Button, TextField } from "@mui/material";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

export function Enable2FAForm() {
  const { userDetails } = useContext(MyContext);
  const [step, setStep] = useState(1);
  const [savingDetails, setSavingDetails] = useState(false);
  const [verification, setverification] = useState(null);
  const [otp, setOtp] = useState(null);

  async function savingChanges() {
    setSavingDetails(true);
    try {
      const details = { TFAEnabled: true };
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userDetails.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, details);
      }
    } catch (e) {
      toast.error("Error saving changes. Please try again");
    } finally {
      setSavingDetails(false);
    }
  }

  const handleChange = (e) => setOtp(e.target.value);

  const verifyotp = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const cred = PhoneAuthProvider.credential(verification, otp);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const user = auth.currentUser;

      await multiFactor(user).enroll(multiFactorAssertion, userDetails.phone)
        .then(() => {
          toast.success("2FA Enabled");
          savingChanges();
        });
    } catch (err) {
      toast.error("Invalid OTP");
      console.error(err);
    }
  };

  return (
    <div className="shadow-lg bg-white/50 backdrop-blur-md rounded-xl p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-left text-xl font-bold">Enable 2-Factor Authentication</h2>
      </div>

      {/* Step progress bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-1 rounded ${step >= 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
        <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-green-500" : "bg-gray-300"}`}></div>
        <div className={`flex-1 h-1 rounded ${step >= 3 ? "bg-green-500" : "bg-gray-300"}`}></div>
      </div>

      {/* Step components */}
      {step === 1 && <StepOne setStep={setStep} />}
      {step === 2 && <StepTwo setStep={setStep} setverification={setverification} />}
      {step === 3 && (
        <div className="p-2 flex flex-col gap-2">
          <TextField
            type="text"
            label="Enter OTP"
            value={otp}
            onChange={handleChange}
            fullWidth
          />
          <Button
            disabled={userDetails?.TFAEnabled}
            onClick={verifyotp}
            variant="contained"
            className="w-full mt-2"
          >
            {savingDetails ? "Verifying" : "Verify"}
          </Button>
        </div>
      )}
    </div>
  );
}
