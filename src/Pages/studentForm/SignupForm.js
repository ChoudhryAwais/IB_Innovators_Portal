import React, { useState, useContext } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import toast from "react-hot-toast";
import Button from "@mui/material/Button";

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
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">
        Register Student
      </h2>

      <form className="space-y-5">
        {/* Full Name */}
        <div className="w-full">
          <label className="block text-gray-800 text-left mb-1">
            Full Name
          </label>
          <input
            required
            type="text"
            placeholder="Enter Full Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="w-full">
          <label className="block text-gray-800 text-left mb-1">Email</label>
          <input
            required
            type="email"
            placeholder="Enter email address"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="w-full">
          <label className="block text-gray-800 text-left mb-1">Password</label>
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setCreateAccountModal(false)}
          >
            CANCEL
          </Button>
          {submitting ? (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              REGISTERING
            </LoadingButton>
          ) : (
            <Button
              onClick={() => SignUpHandler()}
              variant="contained"
              color="success"
            >
              REGISTER
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
