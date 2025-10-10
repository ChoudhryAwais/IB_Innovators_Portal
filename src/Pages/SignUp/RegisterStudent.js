import React, { useState, useContext } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { toast } from "react-hot-toast";
import { Button, TextField, InputAdornment, IconButton, Box } from "@mui/material";


function RegisterStudent() {
  const { setIsUserLoggedIn, setUserDetails, setUserType } = useContext(MyContext);

  // States for student signup
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 same as code1
  
  // Toggle password visibility
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Student signup handler
  const handleStudentSignUp = async (e) => {
    e.preventDefault();

    if (confirmPassword !== signUpPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!signUpEmail || !signUpPassword || !confirmPassword || !userName) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );

      const userId = userCredential.user.uid;
      const details = {
        userId,
        email: signUpEmail,
        type: "student",
        userName
      };

      const userListRef = collection(db, "userList");
      await addDoc(userListRef, details);

      toast.success("Student registered successfully");
      setIsUserLoggedIn(true);
      setUserDetails({ email: signUpEmail, userId, type: "student" });
      setUserType("student");

      // Reset fields
      setSignUpEmail("");
      setSignUpPassword("");
      setConfirmPassword("");
      setUserName("");
    } catch (error) {
      console.error(error);
      toast.error("Error registering student");
    }
  };

  return (
    <div className="w-[450px] mx-auto bg-white rounded-lg p-6">
      {/* Title */}
      <h2 className="text-[30px] font-semibold text-[#16151C]">Student Signup</h2>
      <p className="text-[#A2A1A8] font-light text-[16px] mb-6  normal-case">Please Signup Here</p>

      {/* FORM */}
      <form onSubmit={handleStudentSignUp} className="w-full space-y-4">
        {/* Full Name */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              color: "#A2A1A8",
              pointerEvents: "none",
              fontWeight: 300,
              zIndex: 1,
              color:
                userName.length > 0
                  ? "#4071B6" // highlighted when has value
                  : "#A2A1A8", // default gray
              "&.focused": {
                color: "#4071B6", // highlighted when focused
              },
            }}
            className={userName.length > 0 ? "filled" : ""}
            id="fullName-label"
          >
            Name
          </Box>
          <TextField
            fullWidth
            placeholder="Full Name"
            variant="outlined"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            InputProps={{ sx: { paddingTop: "15px" } }}
            onFocus={() =>
              document.getElementById("fullName-label").classList.add("focused")
            }
            onBlur={() =>
              document.getElementById("fullName-label").classList.remove("focused")
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: userName.length > 0 ? "#4071B60D" : "#fff",
                borderColor: userName.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  userName.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                backgroundColor: "#4071B60D",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
        </Box>

        {/* Email */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              color: "#A2A1A8",
              pointerEvents: "none",
              fontWeight: 300,
              zIndex: 1, color:
                signUpEmail.length > 0
                  ? "#4071B6" // highlighted when has value
                  : "#A2A1A8", // default gray
              "&.focused": {
                color: "#4071B6", // highlighted when focused
              },
            }}
            className={signUpEmail.length > 0 ? "filled" : ""}
            id="email-label"
          >
            Email Address
          </Box>
          <TextField
            fullWidth
            placeholder="email@example.com"
            type="email"
            variant="outlined"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            required
            InputProps={{ sx: { paddingTop: "15px" } }}
            onFocus={() =>
              document.getElementById("email-label").classList.add("focused")
            }
            onBlur={() =>
              document.getElementById("email-label").classList.remove("focused")
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: signUpEmail.length > 0 ? "#4071B60D" : "#fff",
                borderColor: signUpEmail.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  signUpEmail.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                backgroundColor: "#4071B60D",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
        </Box>

        {/* Password */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              color: "#A2A1A8",
              pointerEvents: "none",
              fontWeight: 300,
              zIndex: 1, color:
                signUpPassword.length > 0
                  ? "#4071B6" // highlighted when has value
                  : "#A2A1A8", // default gray
              "&.focused": {
                color: "#4071B6", // highlighted when focused
              },
            }}
            className={signUpPassword.length > 0 ? "filled" : ""}
            id="password-label"
          >
            Password
          </Box>
          <TextField
            fullWidth
            placeholder="••••••••••••••••"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            required
            onFocus={() =>
              document.getElementById("password-label").classList.add("focused")
            }
            onBlur={() =>
              document.getElementById("password-label").classList.remove("focused")
            }
            InputProps={{
              sx: { paddingTop: "15px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                    sx={{
                      mb: "15px"
                    }}>
                      {showPassword ? (
                    <svg
                      width="24"
                      height="25"
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5299 9.96992L9.46992 15.0299C8.81992 14.3799 8.41992 13.4899 8.41992 12.4999C8.41992 10.5199 10.0199 8.91992 11.9999 8.91992C12.9899 8.91992 13.8799 9.31992 14.5299 9.96992Z"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.8198 6.27047C16.0698 4.95047 14.0698 4.23047 11.9998 4.23047C8.46984 4.23047 5.17984 6.31047 2.88984 9.91047C1.98984 11.3205 1.98984 13.6905 2.88984 15.1005C3.67984 16.3405 4.59984 17.4105 5.59984 18.2705"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.41992 20.0297C9.55992 20.5097 10.7699 20.7697 11.9999 20.7697C15.5299 20.7697 18.8199 18.6897 21.1099 15.0897C22.0099 13.6797 22.0099 11.3097 21.1099 9.89969C20.7799 9.37969 20.4199 8.88969 20.0499 8.42969"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5095 13.1992C15.2495 14.6092 14.0995 15.7592 12.6895 16.0192"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.47 15.0293L2 22.4993"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21.9993 2.5L14.5293 9.97"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ) : (
                      // 👁️‍🗨️ Eye Off SVG
                      <svg
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5299 9.80781L9.46992 14.8678C8.81992 14.2178 8.41992 13.3278 8.41992 12.3378C8.41992 10.3578 10.0199 8.75781 11.9999 8.75781C12.9899 8.75781 13.8799 9.15781 14.5299 9.80781Z"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.8198 6.10836C16.0698 4.78836 14.0698 4.06836 11.9998 4.06836C8.46984 4.06836 5.17984 6.14836 2.88984 9.74836C1.98984 11.1584 1.98984 13.5284 2.88984 14.9384C3.67984 16.1784 4.59984 17.2484 5.59984 18.1084"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.41992 19.8676C9.55992 20.3476 10.7699 20.6076 11.9999 20.6076C15.5299 20.6076 18.8199 18.5276 21.1099 14.9276C22.0099 13.5176 22.0099 11.1476 21.1099 9.73758C20.7799 9.21758 20.4199 8.72758 20.0499 8.26758"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.5095 13.0371C15.2495 14.4471 14.0995 15.5971 12.6895 15.8571"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.47 14.8672L2 22.3372"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21.9993 2.33789L14.5293 9.80789"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: signUpPassword.length > 0 ? "#4071B60D" : "#fff",
                borderColor: signUpPassword.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  signUpPassword.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                backgroundColor: "#4071B60D",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
        </Box>

        {/* Confirm Password */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              color: "#A2A1A8",
              pointerEvents: "none",
              fontWeight: 300,
              zIndex: 1, color:
                confirmPassword.length > 0
                  ? "#4071B6" // highlighted when has value
                  : "#A2A1A8", // default gray
              "&.focused": {
                color: "#4071B6", // highlighted when focused
              },
            }}
            className={confirmPassword.length > 0 ? "filled" : ""}
            id="confirm-password-label"
          >
            Confirm Password
          </Box>
          <TextField
            fullWidth
            placeholder="••••••••••••••••"
            type={showConfirmPassword ? "text" : "password"}
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            onFocus={() =>
              document.getElementById("confirm-password-label").classList.add("focused")
            }
            onBlur={() =>
              document.getElementById("confirm-password-label").classList.remove("focused")
            }
            InputProps={{
              sx: { paddingTop: "15px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end"
                    sx={{
                      mb: "15px"
                    }}>
                      {showConfirmPassword ? (
                    <svg
                      width="24"
                      height="25"
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5299 9.96992L9.46992 15.0299C8.81992 14.3799 8.41992 13.4899 8.41992 12.4999C8.41992 10.5199 10.0199 8.91992 11.9999 8.91992C12.9899 8.91992 13.8799 9.31992 14.5299 9.96992Z"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.8198 6.27047C16.0698 4.95047 14.0698 4.23047 11.9998 4.23047C8.46984 4.23047 5.17984 6.31047 2.88984 9.91047C1.98984 11.3205 1.98984 13.6905 2.88984 15.1005C3.67984 16.3405 4.59984 17.4105 5.59984 18.2705"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.41992 20.0297C9.55992 20.5097 10.7699 20.7697 11.9999 20.7697C15.5299 20.7697 18.8199 18.6897 21.1099 15.0897C22.0099 13.6797 22.0099 11.3097 21.1099 9.89969C20.7799 9.37969 20.4199 8.88969 20.0499 8.42969"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5095 13.1992C15.2495 14.6092 14.0995 15.7592 12.6895 16.0192"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.47 15.0293L2 22.4993"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21.9993 2.5L14.5293 9.97"
                        stroke="#A2A1A8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ) : (
                      // 👁️‍🗨️ Eye Off SVG
                      <svg
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5299 9.80781L9.46992 14.8678C8.81992 14.2178 8.41992 13.3278 8.41992 12.3378C8.41992 10.3578 10.0199 8.75781 11.9999 8.75781C12.9899 8.75781 13.8799 9.15781 14.5299 9.80781Z"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.8198 6.10836C16.0698 4.78836 14.0698 4.06836 11.9998 4.06836C8.46984 4.06836 5.17984 6.14836 2.88984 9.74836C1.98984 11.1584 1.98984 13.5284 2.88984 14.9384C3.67984 16.1784 4.59984 17.2484 5.59984 18.1084"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.41992 19.8676C9.55992 20.3476 10.7699 20.6076 11.9999 20.6076C15.5299 20.6076 18.8199 18.5276 21.1099 14.9276C22.0099 13.5176 22.0099 11.1476 21.1099 9.73758C20.7799 9.21758 20.4199 8.72758 20.0499 8.26758"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.5095 13.0371C15.2495 14.4471 14.0995 15.5971 12.6895 15.8571"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.47 14.8672L2 22.3372"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21.9993 2.33789L14.5293 9.80789"
                          stroke="#16151C"
                          strokeWidth="1.67528"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: confirmPassword.length > 0 ? "#4071B60D" : "#fff",
                borderColor: confirmPassword.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  confirmPassword.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                backgroundColor: "#4071B60D",
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
        </Box>

        {/* Button */}
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ fontWeight: 600,backgroundColor: "#4071B6", textTransform: "none", py: 1.5, borderRadius: "10px" }}
        >
          Register Student
        </Button>
      </form>
    </div>
  );


}

export default RegisterStudent;

