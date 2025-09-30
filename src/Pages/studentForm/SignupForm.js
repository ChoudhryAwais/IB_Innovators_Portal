import React, { useState, useContext } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import toast from "react-hot-toast";

import { MenuItem, Select, Button, TextField, Modal, Divider } from "@mui/material"

import emailjs from "emailjs-com";
import getStudentRegisterEmailTemplate from "../../Components/getEmailTemplate/getStudentRegisterEmailTemplate";

function SignupForm({ student, setCreateAccountModal }) {
  const { setUserDetails, setUserType } = useContext(MyContext);

  const [submitting, setSubmitting] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState(student?.userDetails?.email);
  const [signUpPassword, setSignUpPassword] = useState("Basic1234");
  const [showPassword, setShowPassword] = useState(true);
  const [myUserType, setMyUserType] = useState("student");
  const [userName, setUserName] = useState(
    `${student?.userDetails?.firstName} ${student?.userDetails?.lastName}`
  );

  const navigate = useNavigate();

  const SignUpHandler = async () => {
    setSubmitting(true);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );

      const userId = userCredential.user.uid;
      const userDetailsRef = doc(db, "userList", userId);

      let details = {
        userId,
        email: signUpEmail,
        type: myUserType,
        userName,
        otherInformation: student,
        credits: 0,
        phone: student?.userDetails?.phone || "",
      };

      await setDoc(userDetailsRef, details);

      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const emailUserId = process.env.REACT_APP_EMAILUSERID;

      const studentAndParentEmail = [
        signUpEmail,
        student?.userDetails?.parentEmail,
      ];
      const emailTemplate = getStudentRegisterEmailTemplate(
        userName,
        signUpEmail,
        signUpPassword
      );

      const emailParams = {
        from_name: "IBInnovators",
        to_name: "IBInnovators",
        send_to: studentAndParentEmail?.join(", "),
        subject: "Your Student Portal Login Credentials",
        message: emailTemplate,
      };

      emailjs.send(serviceId, templateId, emailParams, emailUserId);

      setSignUpEmail("");
      setSignUpPassword("");
      setMyUserType("student");
      setUserName("");
      setCreateAccountModal(false);
      toast.success("Account Registered");
    } catch (error) {
      toast.error("Error signing up user");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-[#16151C]">
          Register Student
        </h2>
        <button
          onClick={() => setCreateAccountModal(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg
            className="w-5 h-5 text-[#16151C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

      {/* Full Name */}
      <TextField
        required
        fullWidth
        label="Full Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: true, required: false }}
        InputProps={{
          notched: false, // 🔑 removes the notch in the outline
        }}
        sx={{
          mb: 4,
          "& .MuiInputLabel-root": {
            position: "relative",
            marginBottom: "6px",
            transform: "none",
            fontWeight: 300,
            color: "#A2A1A8",
            fontSize: "12px",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": {
              borderColor: "#A2A1A833",
            }
          },
        }}
      />

      <TextField
        required
        fullWidth
        type="email"
        label="Email Address"
        value={signUpEmail}
        onChange={(e) => setSignUpEmail(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: true, required: false }}
        InputProps={{
          notched: false,
        }}
        sx={{
          mb: 4,
          "& .MuiInputLabel-root": {
            position: "relative",
            marginBottom: "6px",
            transform: "none",
            fontWeight: 300,
            color: "#A2A1A8",
            fontSize: "12px",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": {
              borderColor: "#A2A1A833",
            }
          },
        }}
      />

      <TextField
        required
        fullWidth
        type={showPassword ? "text" : "password"}
        label="Password"
        value={signUpPassword}
        onChange={(e) => setSignUpPassword(e.target.value)}
        variant="outlined"
        InputLabelProps={{ shrink: true, required: false }}
        InputProps={{
          notched: false,
        }}
        sx={{
          mb: 7,
          "& .MuiInputLabel-root": {
            position: "relative",
            marginBottom: "6px",
            transform: "none",
            fontWeight: 300,
            color: "#A2A1A8",
            fontSize: "12px",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": {
              borderColor: "#A2A1A833",
            }
          },
        }}
      />


      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={() => setCreateAccountModal(false)}
          variant="outlined"
          sx={{
            width: 166,
            height: 50,
            borderRadius: "10px",
            borderColor: "#A2A1A833",
            fontSize: "16px",
            fontWeight: 300,
            color: "#16151C",
            "&:hover": {
              borderColor: "#9CA3AF",
              backgroundColor: "#F9FAFB",
            },
          }}
        >
          Cancel
        </Button>

        {submitting ? (
          <Button
            disabled
            variant="contained"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              backgroundColor: "#4071B6",
              fontSize: "16px",
              fontWeight: 400,
              color: "#FFFFFF",
              textTransform: "none",
            }}
          >
            Registering...
          </Button>
        ) : (
          <Button
            onClick={SignUpHandler}
            variant="contained"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              backgroundColor: "#4071B6",
              fontSize: "16px",
              fontWeight: 400,
              color: "#FFFFFF",
              textTransform: "none",
            }}
          >
            Register
          </Button>
        )}
      </div>
    </div>
  );
}

export default SignupForm;
