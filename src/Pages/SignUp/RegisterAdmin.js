import React, { useState, useContext } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { toast } from "react-hot-toast";
import { Button, TextField, InputAdornment, IconButton, Box } from "@mui/material";

function RegisterAdmin() {
  const { setIsUserLoggedIn, setUserDetails, setUserType } =
    useContext(MyContext);

  // states
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 same as code1

  // handler
  const handleAdminSignUp = async (e) => {
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
        type: "admin",
        userName,
      };

      const userListRef = collection(db, "userList");
      await addDoc(userListRef, details);

      toast.success("Admin registered successfully");
      setIsUserLoggedIn(true);
      setUserDetails({ email: signUpEmail, userId, type: "admin" });
      setUserType("admin");

      // reset fields
      setSignUpEmail("");
      setSignUpPassword("");
      setConfirmPassword("");
      setUserName("");
    } catch (error) {
      console.error(error);
      toast.error("Error registering admin");
    }
  };

  return (
    <div className="w-[450px] mx-auto bg-white rounded-lg  p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900">Admin Signup</h2>
      <p className="text-gray-400 text-sm mb-6">Please Signup Here</p>

      {/* FORM */}
      <form onSubmit={handleAdminSignUp} className="w-full space-y-4">
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
            }}
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
            InputProps={{
              sx: { paddingTop: "15px" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "55px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
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
            }}
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
            InputProps={{
              sx: { paddingTop: "15px" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "55px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
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
            }}
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
            InputProps={{
              sx: { paddingTop: "15px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                    sx={{
                      mb:"15px"
                    }}>
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
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "55px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
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
            }}
          >
            Confirm Password
          </Box>
          <TextField
            fullWidth
            placeholder="••••••••••••••••"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              sx: { paddingTop: "15px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                    sx={{
                      mb:"15px"
                    }}>
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
                    </svg>                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "55px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4071B6",
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
          sx={{ backgroundColor: "#4071B6", textTransform: "none", py: 1.5 }}
        >
          Register Admin
        </Button>
      </form>
    </div>
  );
}

export default RegisterAdmin;
