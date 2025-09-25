import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";

import toast from "react-hot-toast";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Divider, Checkbox } from "@mui/material";

import emailjs from "emailjs-com";
import getTutorRegisterEmailTemplate from "../../Components/getEmailTemplate/getTutorRegisterEmailTemplate";
import { useLocation, useNavigate } from "react-router-dom";

function SignupForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const tutor = location.state?.tutor || {};

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
          .then((response) => { })
          .catch((error) => { });

        setSignUpEmail("");
        setSignUpPassword("");
        setSubjectsToTeach("");
        setMyUserType("teacher");
        setUserName("");
        setHourlyRate("");
        setTutorTier("");

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
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Tutor</h1>
        <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />

        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              required
              type="text"
              placeholder="Enter Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              required
              type="email"
              placeholder="Enter email address"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>


          {/* Tutor Tier */}
          <div>
            <p className="text-xs font-medium text-gray-800 mb-2">Tutor Tier*</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: "Standard ($24)", value: "Standard" },
                { label: "Top ($28)", value: "Top" },
                { label: "Enter hourly rate", value: "Other" }, // 👈 changed label here
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (option.value === "Standard") setHourlyRate(24);
                    else if (option.value === "Top") setHourlyRate(28);
                    else setHourlyRate(0);
                    setTutorTier(option.value);
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all w-40 h-14
          ${tutorTier === option.value
                      ? "bg-blue-600 text-white border border-transparent"
                      : "bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>


          {/* Hourly Rate (if Other) */}
          {tutorTier === "Other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate in USD ($)
              </label>
              <input
                required
                type="number"
                placeholder="Enter hourly rate"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          )}

          {/* Subjects to Teach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects to Teach
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(subjectsToTeach).map(([subject, value]) => (
                <div
                  key={subject}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                >
                  <label className="flex items-center gap-2 text-gray-900 cursor-pointer">
                    <Checkbox
                      checked={value}
                      onChange={() => handleChange(subject)}
                      sx={{
                        color: "#A2A1A833", // unchecked border color
                        "&.Mui-checked": {
                          color: "#4071B6", // checked color
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 26, // bigger checkbox icon
                        },
                      }}
                    />
                    {subject}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDelete(subject)}
                    className="hover:opacity-80"
                  >
                    <svg
                      width="20"
                      height="22"
                      viewBox="0 0 20 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 7V17C3 19.2091 4.79086 21 7 21H13C15.2091 21 17 19.2091 17 17V7M12 10V16M8 10L8 16M14 4L12.5937 1.8906C12.2228 1.3342 11.5983 1 10.9296 1H9.07037C8.40166 1 7.7772 1.3342 7.40627 1.8906L6 4M14 4H6M14 4H19M6 4H1"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              required
              type="text"
              placeholder="Enter password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <div className="flex justify-end gap-3 pt-6">
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  borderColor: "#D1D5DB",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#374151",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                disabled={submitting || !hourlyRate}
                variant="contained"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  backgroundColor: "#4071B6",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#4071B6" },
                  "&:disabled": { backgroundColor: "#9CA3AF" },
                }}
                onClick={SignUpHandler}
              >
                {submitting ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

}

export default SignupForm;
