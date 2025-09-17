import React, { useRef, useState, useEffect, useContext } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, getMultiFactorResolver} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { MyContext } from "../../../Context/MyContext";
import moment from "moment-timezone";
import { toast } from "react-hot-toast";
import OtpInput from "react-otp-input";
import { Eye, EyeOff } from "lucide-react"

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
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
          <input
            type="email"
            ref={emailRef}
            placeholder="Adminname@example.com"
            value={loginData.email}
            onChange={handleEmailInput}
            onBlur={handleEmailBlur}
            className={`w-full h-[62px] px-4 py-3 border-[1.12px] rounded-lg  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              emailError ? "border-red-500 bg-red-50" : "border-[#4071B6]"
            }`}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              ref={passwordRef}
              placeholder="••••••••••••"
              value={loginData.password}
              onChange={handlePasswordInput}
              onBlur={handlePasswordBlur}
              className={`w-full px-4 py-3 pr-12 border-[1.12px] rounded-lg  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                passwordError ? "border-red-500 bg-red-50" : "border-[#4071B6]"
              }`}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-600">Remember Me</span>
        </label>
        <button
          type="button"
          onClick={forgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {notification && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{notification}</p>}

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4071B6] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>

      {formError && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{formError}</p>}
    </form>
  )
}