import { Button } from "@mui/material";
import { db, auth } from "../../firebase";
import React, { useEffect, useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import { MuiTelInput } from "mui-tel-input";

import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  multiFactor,
} from "firebase/auth";

export default function StepTwo({ setStep, setverification }) {
  const { userDetails } = useContext(MyContext);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userDetails?.phone) {
      setPhone(userDetails?.phone);
    }
  }, [userDetails?.phone]);

  const handleChange = (newPhone) => {
    setPhone(newPhone);
  };

  async function saveAndNext(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const details = { phone };
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userDetails.userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, details);
      }
      sentotp();
    } catch (e) {
      toast.error("Error saving number. Please try again");
    }
  }

  const sentotp = async () => {
    try {
      auth.onAuthStateChanged(async (user) => {
        const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => console.log("recaptcha resolved.."),
        });
        recaptchaVerifier.render();
        await multiFactor(user)
          .getSession()
          .then((multiFactorSession) => {
            const phoneInfoOptions = {
              phoneNumber: phone?.split(" ")?.join(""),
              session: multiFactorSession,
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
          })
          .then((verificationId) => {
            setverification(verificationId);
            toast.success("OTP Sent");
            setStep((prev) => prev + 1);
          });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={saveAndNext} className="flex flex-col gap-3">
      <h5 className="text-lg font-semibold">Please confirm your phone number</h5>

      <MuiTelInput
        className="w-full mb-2"
        required
        value={phone}
        onChange={handleChange}
      />

      <Button
        variant="contained"
        disabled={loading}
        type="submit"
        className="w-full"
      >
        {loading ? "Sending OTP" : "Confirm and Send OTP"}
      </Button>
    </form>
  );
}
