import React, { useRef, useState, useEffect, useContext } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, getMultiFactorResolver } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { MyContext } from "../../../Context/MyContext";
import moment from "moment-timezone";
import { toast } from "react-hot-toast";
import OtpInput from "react-otp-input";
import { Eye, EyeOff } from "lucide-react"
import { TextField, Box, InputAdornment, IconButton, Checkbox } from "@mui/material";


export default function LoginForm() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolver, setResolver] = useState(null);
  const [otp, setOtp] = useState(null);
  const [verification, setVerification] = useState(null);
  const [show, setShow] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [rememberMe, setRememberMe] = useState(true)
  const emailRef = useRef();
  const passwordRef = useRef();

  const { setIsUserLoggedIn, setUserDetails, setUserType } = useContext(MyContext);

  const timeZone = moment.tz.guess();

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const isValidPassword = (password) => password.length >= 8;

  const handleEmailBlur = () => {
    if (!loginData.email) setEmailError("Please enter your email address.");
    else if (!isValidEmail(loginData.email)) setEmailError("Please enter a valid email address.");
  };

  const handlePasswordBlur = () => {
    if (!loginData.password) setPasswordError("Please enter your password.");
  };

  const handleEmailInput = (e) => {
    setLoginData(prev => ({ ...prev, email: e.target.value }));
    setEmailError(""); setFormError(""); setNotification("");
  };

  const handlePasswordInput = (e) => {
    setLoginData(prev => ({ ...prev, password: e.target.value }));
    setPasswordError(""); setFormError(""); setNotification("");
  };

  const focusEmail = () => emailRef.current.focus();
  const focusPassword = () => passwordRef.current.focus();

  const forgotPassword = async () => {
    if (!loginData.email) setEmailError("Please enter your email address.");
    else if (!isValidEmail(loginData.email)) setEmailError("Please enter a valid email address.");
    else {
      try {
        await sendPasswordResetEmail(auth, loginData.email);
        setNotification("Password reset email sent. Please reset your password and log in.");
      } catch (e) {
        setFormError(e.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email) return setEmailError("Please enter your email address.");
    if (!isValidEmail(loginData.email)) return setEmailError("Please enter a valid email address.");
    if (!loginData.password) return setPasswordError("Please enter your password.");
    if (!isValidPassword(loginData.password)) return setPasswordError("Password must be at least 8 characters.");

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const userId = userCredential.user.uid;
      const docRef = doc(db, "userList", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        setIsUserLoggedIn(true);
        setUserType(docSnap.data()?.type);
        await updateDoc(docRef, { timeZone });
      } else setFormError("No account found. Please register.");
    } catch (error) {
      setFormError(error.code);
      if (error.code === "auth/multi-factor-auth-required") setResolver(getMultiFactorResolver(auth, error));
    } finally { setLoading(false); }
  };

  const handleChange = (newValue) => setOtp(newValue);

  useEffect(() => {
    if (resolver?.hints[0]) {
      const sendOtp = async () => {
        setSending(true);
        const recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', { size: 'invisible' });
        recaptchaVerifier.render();
        const phoneOpts = { multiFactorHint: resolver.hints[0], session: resolver.session };
        const phoneAuthProvider = new window.firebase.auth.PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneOpts, recaptchaVerifier);
        setVerification(verificationId);
        setShow(true);
        setSending(false);
      };
      sendOtp();
    }
  }, [resolver]);

  const verify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const cred = window.firebase.auth.PhoneAuthProvider.credential(verification, otp);
      const multiFactorAssertion = window.firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
      await resolver.resolveSignIn(multiFactorAssertion);
    } catch {
      toast.error("Invalid OTP");
    } finally { setVerifying(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email Field */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              pointerEvents: "none",
              zIndex: 1,
              color: loginData.email.length > 0 ? "#4071B6" : "#A2A1A8",
              "&.focused": { color: "#4071B6" },
            }}
            className={loginData.email.length > 0 ? "filled" : ""}
            id="login-email-label"
          >
            Email Address
          </Box>
          <TextField
            fullWidth
            placeholder="Adminname@example.com"
            type="email"
            value={loginData.email}
            onChange={handleEmailInput}
            onBlur={handleEmailBlur}
            inputRef={emailRef}
            required
            InputProps={{ sx: { paddingTop: "15px" } }}
            onFocus={() =>
              document.getElementById("login-email-label").classList.add("focused")
            }
            onBlurCapture={() =>
              document.getElementById("login-email-label").classList.remove("focused")
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: loginData.email.length > 0 ? "#4071B60D" : "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: emailError ? "red" : loginData.email.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4071B6" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4071B6" },
              "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#4071B60D" },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </Box>

        {/* Password Field */}
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              left: "14px",
              fontSize: "11px",
              pointerEvents: "none",
              zIndex: 1,
              color: loginData.password.length > 0 ? "#4071B6" : "#A2A1A8",
              "&.focused": { color: "#4071B6" },
            }}
            className={loginData.password.length > 0 ? "filled" : ""}
            id="login-password-label"
          >
            Password
          </Box>
          <TextField
            fullWidth
            placeholder="••••••••••••"
            type={showPassword ? "text" : "password"}
            value={loginData.password}
            onChange={handlePasswordInput}
            onBlur={handlePasswordBlur}
            inputRef={passwordRef}
            required
            InputProps={{
              sx: { paddingTop: "15px" },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                    sx={{ mb: "15px" }}
                  >
                    {showPassword ? (
                      // 👁️ Eye Open SVG
                      <svg
                        width="22"
                        height="16"
                        viewBox="0 0 22 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.1303 5.8531C21.2899 7.07317 21.2899 8.92683 20.1303 10.1469C18.1745 12.2047 14.8155 15 11 15C7.18448 15 3.82549 12.2047 1.86971 10.1469C0.710098 8.92683 0.710098 7.07317 1.86971 5.8531C3.82549 3.79533 7.18448 1 11 1C14.8155 1 18.1745 3.79533 20.1303 5.8531Z"
                          stroke="#28303F"
                          stroke-width="1.5"
                        />
                        <path
                          d="M14 8C14 9.65685 12.6569 11 11 11C9.34315 11 8 9.65685 8 8C8 6.34315 9.34315 5 11 5C12.6569 5 14 6.34315 14 8Z"
                          stroke="#28303F"
                          stroke-width="1.5"
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
            onFocus={() =>
              document.getElementById("login-password-label").classList.add("focused")
            }
            onBlurCapture={() =>
              document.getElementById("login-password-label").classList.remove("focused")
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: "55px",
                backgroundColor: loginData.password.length > 0 ? "#4071B60D" : "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: passwordError ? "red" : loginData.password.length > 0 ? "#4071B6" : "#A2A1A833",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4071B6" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4071B6" },
              "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#4071B60D" },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "#A2A1A833",
                opacity: 1,
                fontSize: "16px",
              },
            }}
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </Box>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center">
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            sx={{
              width: "26.8px",
              height: "26.8px",
              color: "#A2A1A833", // unchecked border color
              "&.Mui-checked": {
                color: "#4071B6", // checked color
              },
              "& .MuiSvgIcon-root": {
                fontSize: "26.8px", // match size
              },
            }}
          />
          <span className="ml-2 text-[16px] font-light text-[#16151C]">
            Remember Me
          </span>
        </label>
        <button
          type="button"
          onClick={forgotPassword}
          className="text-[15.64px] text-[#4071B6] hover:text-blue-800 font-light transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {notification && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{notification}</p>}

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[62px] bg-[#4071B6] hover:bg-[#315991ff] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-[20px] font-semibold tracking-wide">Logging in...</span>
          </>
        ) : (
          <span className="text-[20px] font-semibold tracking-wide">Login</span>
        )}
      </button>

      {formError && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{formError}</p>}
    </form>
  )
}