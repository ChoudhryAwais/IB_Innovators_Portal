import React, { useState  } from "react";
import styles from "./SignUpOnly.module.css";
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
        const emailTemplate = getTutorRegisterEmailTemplate(userName, signUpEmail, signUpPassword);
        
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
    <div>
      <div>
        <h2 className={styles.headerTitle}>Register Tutor</h2>

        <form>
          <div style={{ width: "100%" }}>
            <div
              style={{
                color: "#1e1e1e",
                textAlign: "left",
                flex: 1,
                width: "100%",
              }}
            >
              Full Name
            </div>
            <input
              required
              type="text"
              placeholder="Enter Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{
                height: "50px",
                paddingLeft: "15px",
                width: "100%",
                background: "rgba(255,255,255,0.4)",
                outline: "none",
                borderRadius: "5px",
                border: "1px solid #eee",
              }}
            />
          </div>

          <div style={{ width: "100%", marginTop: "20px" }}>
            <div
              style={{
                color: "#1e1e1e",
                textAlign: "left",
                flex: 1,
                width: "100%",
              }}
            >
              Email
            </div>
            <input
              required
              type="email"
              placeholder="Enter email address"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              style={{
                height: "50px",
                paddingLeft: "15px",
                width: "100%",
                background: "rgba(255,255,255,0.4)",
                outline: "none",
                borderRadius: "5px",
                border: "1px solid #eee",
              }}
            />
          </div>

          <div style={{ width: "100%", marginTop: "20px" }}>
            <div
              style={{
                color: "#1e1e1e",
                textAlign: "left",
                flex: 1,
                width: "100%",
              }}
            >
              Tutor Tier
            </div>
            <select
              style={{
                height: "50px",
                paddingLeft: "15px",
                width: "100%",
                background: "rgba(255,255,255,0.4)",
                outline: "none",
                borderRadius: "5px",
                border: "1px solid #eee",
              }}
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
              aria-label=".form-select-sm example"
              value={tutorTier}
            >
              <option value="">Select</option>
              <option value="Standard">Standard ($24)</option>
              <option value="Top">Top ($28)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {tutorTier === "Other" && (
            <div style={{ width: "100%", marginTop: "20px" }}>
              <div
                style={{
                  color: "#1e1e1e",
                  textAlign: "left",
                  flex: 1,
                  width: "100%",
                }}
              >
                Hourly Rate in USD ($)
              </div>
              <input
                required
                type="number"
                placeholder="Enter hourly rate"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                style={{
                  height: "50px",
                  paddingLeft: "15px",
                  width: "100%",
                  background: "rgba(255,255,255,0.4)",
                  outline: "none",
                  borderRadius: "5px",
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}

          <div style={{ width: "100%", marginTop: "20px" }}>
            <div
              style={{
                color: "#1e1e1e",
                textAlign: "left",
                flex: 1,
                width: "100%",
                marginBottom: "10px",
              }}
            >
              Subjects to Teach
            </div>
            {Object.entries(subjectsToTeach).map(([subject, value]) => (
              <div
                key={subject}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #9e9e9e",
                }}
              >
                <label
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
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

          <div style={{ width: "100%", marginTop: "20px" }}>
            <div
              style={{
                color: "#1e1e1e",
                textAlign: "left",
                flex: 1,
                width: "100%",
              }}
            >
              Password
            </div>
            <input
              required
              type={"text"}
              placeholder="Enter your password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              style={{
                height: "50px",
                paddingLeft: "15px",
                width: "100%",
                background: "rgba(255,255,255,0.4)",
                outline: "none",
                borderRadius: "5px",
                border: "1px solid #eee",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              marginTop: "20px",
            }}
          >
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
    </div>
  );
}

export default SignupForm;
