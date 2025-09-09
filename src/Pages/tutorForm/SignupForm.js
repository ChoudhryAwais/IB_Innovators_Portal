import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";

import toast from "react-hot-toast";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import emailjs from "emailjs-com";
import getTutorRegisterEmailTemplate from "../../Components/getEmailTemplate/getTutorRegisterEmailTemplate";

function SignupForm({ tutor, setCreateAccountModal }) {
  const [signUpEmail, setSignUpEmail] = useState(tutor?.email);
  const [signUpPassword, setSignUpPassword] = useState("Basic1234");
  const [subjectsToTeach, setSubjectsToTeach] = useState({
    ...tutor?.subjects.reduce(
      (acc, subject) => ({ ...acc, [subject]: true }),
      {}
    ),
  });
  const [myUserType, setMyUserType] = useState("teacher");
  const [userName, setUserName] = useState(
    `${tutor?.firstName}${" "}${tutor?.lastName}`
  );
  const [hourlyRate, setHourlyRate] = useState(0);
  const [tutorTier, setTutorTier] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const SignUpHandler = async () => {
    if (
      signUpEmail === "" ||
      signUpPassword === "" ||
      hourlyRate === 0 ||
      tutorTier === ""
    ) {
      toast("Please fill all details");
    } else {
      setSubmitting(true);
      try {
        const auth = getAuth();

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          signUpEmail,
          signUpPassword
        );

        const userId = userCredential.user.uid;
        let details;
        if (myUserType === "teacher") {
          details = {
            userId,
            email: signUpEmail,
            type: myUserType,
            userName,
            subjects: subjectsToTeach,
            isAvailable: "Yes",
            city: tutor.city,
            state: tutor.state,
            zip: tutor.zip,
            hourlyRate: hourlyRate,
            tutorTier,
          };
        } else {
          details = {
            userId,
            email: signUpEmail,
            type: myUserType,
            userName,
          };
        }

        const userDetailsRef = doc(db, "userList", userId);
        await setDoc(userDetailsRef, details);

        const serviceId = process.env.REACT_APP_EMAILSERVICEID;
        const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
        const emailUserId = process.env.REACT_APP_EMAILUSERID;
        const emailTemplate = getTutorRegisterEmailTemplate(
          userName,
          signUpEmail,
          signUpPassword
        );

        const emailParams = {
          from_name: "IBInnovators",
          to_name: "IBInnovators",
          send_to: signUpEmail,
          subject: "Your Tutor Portal Login Credentials",
          message: emailTemplate,
        };

        emailjs
          .send(serviceId, templateId, emailParams, emailUserId)
          .then((response) => {})
          .catch((error) => {});

        setSignUpEmail("");
        setSignUpPassword("");
        setSubjectsToTeach("");
        setMyUserType("teacher");
        setUserName("");
        setHourlyRate("");
        setTutorTier("");
        setCreateAccountModal(false);

        toast.success("Tutor Registered");
      } catch (error) {
        toast.error("Error signing up user");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleChange = (subject) => {
    setSubjectsToTeach((prevState) => ({
      ...prevState,
      [subject]: !prevState[subject],
    }));
  };

  const handleDelete = (subject) => {
    const { [subject]: omit, ...rest } = subjectsToTeach;
    setSubjectsToTeach(rest);
  };

  return (
    <div className="p-4">
      <h2 className="text-center py-8 text-2xl font-semibold">
        Register Tutor
      </h2>

      <form className="w-full">
        {/* Full Name */}
        <div className="w-full">
          <label className="text-left text-gray-900 block">Full Name</label>
          <input
            required
            type="text"
            placeholder="Enter Full Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 border border-gray-200 rounded-md outline-none"
          />
        </div>

        {/* Email */}
        <div className="w-full mt-5">
          <label className="text-left text-gray-900 block">Email</label>
          <input
            required
            type="email"
            placeholder="Enter email address"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 border border-gray-200 rounded-md outline-none"
          />
        </div>

        {/* Tutor Tier */}
        <div className="w-full mt-5">
          <label className="text-left text-gray-900 block">Tutor Tier</label>
          <select
            className="h-12 w-full px-4 bg-white/40 border border-gray-200 rounded-md outline-none"
            onChange={(e) => {
              if (e.target.value === "Standard") {
                setHourlyRate(24);
              } else if (e.target.value === "Top") {
                setHourlyRate(28);
              } else {
                setHourlyRate(0);
              }
              setTutorTier(e.target.value);
            }}
            value={tutorTier}
          >
            <option value="">Select</option>
            <option value="Standard">Standard ($24)</option>
            <option value="Top">Top ($28)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Hourly Rate */}
        {tutorTier === "Other" && (
          <div className="w-full mt-5">
            <label className="text-left text-gray-900 block">
              Hourly Rate in USD ($)
            </label>
            <input
              required
              type="number"
              placeholder="Enter hourly rate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="h-12 w-full px-4 bg-white/40 border border-gray-200 rounded-md outline-none"
            />
          </div>
        )}

        {/* Subjects */}
        <div className="w-full mt-5">
          <label className="text-left text-gray-900 block mb-2">
            Subjects to Teach
          </label>
          {Object.entries(subjectsToTeach).map(([subject, value]) => (
            <div
              key={subject}
              className="flex justify-between border-b border-gray-400 py-2"
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleChange(subject)}
                />
                {subject}
              </label>
              <IconButton
                aria-label="delete"
                size="large"
                onClick={() => handleDelete(subject)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </div>
          ))}
        </div>

        {/* Password */}
        <div className="w-full mt-5">
          <label className="text-left text-gray-900 block">Password</label>
          <input
            required
            type="text"
            placeholder="Enter your password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            className="h-12 w-full px-4 bg-white/40 border border-gray-200 rounded-md outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-end items-center gap-3 w-full mt-6">
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
              disabled={!hourlyRate}
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
