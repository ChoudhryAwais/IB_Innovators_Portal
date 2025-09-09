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
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col items-center w-full gap-6">
      {formError !== "auth/multi-factor-auth-required" ? (
        <>
          <div className="flex flex-col gap-5 w-11/12 md:w-3/4">
            <div>
              <label className="block text-lg mb-2">Email</label>
              <div onClick={focusEmail} onBlur={handleEmailBlur} className={`flex items-center justify-between px-5 py-3 border rounded-3xl ${emailError ? 'border-red-500' : 'border-gray-400'}`}>
                <input
                  type="email"
                  ref={emailRef}
                  placeholder="johndoe@example.com"
                  value={loginData.email}
                  onChange={handleEmailInput}
                  className="flex-1 bg-transparent outline-none text-gray-900 text-base"
                />
              </div>
              {emailError && <p className="text-red-500 mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-lg mb-2">Password</label>
              <div onClick={focusPassword} onBlur={handlePasswordBlur} className={`flex items-center justify-between px-5 py-3 border rounded-3xl ${passwordError ? 'border-red-500' : 'border-gray-400'}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  placeholder="********"
                  value={loginData.password}
                  onChange={handlePasswordInput}
                  className="flex-1 bg-transparent outline-none text-gray-900 text-base"
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={toggleShowPassword}
                  className="cursor-pointer ml-2 text-gray-600"
                />
              </div>
              {passwordError && <p className="text-red-500 mt-1">{passwordError}</p>}
            </div>
          </div>

          <div className="flex justify-end w-11/12 md:w-3/4 mt-2">
            <button type="button" onClick={forgotPassword} className="text-gray-500 font-bold hover:underline">
              Forgot Password?
            </button>
          </div>

          {notification && <p className="text-green-500 text-center mt-2">{notification}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-11/12 md:w-3/4 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-3xl mt-2 font-bold text-lg flex justify-center items-center disabled:opacity-50"
          >
            {loading ? "Logging In" : "Login"}
          </button>

          {formError && <p className="text-red-500 mt-2 text-center">{formError}</p>}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-11/12 md:w-3/4">
          <OtpInput
            value={otp}
            onChange={handleChange}
            numInputs={6}
            inputStyle={{ width: "50px", height: "70px", borderRadius: "0.625rem", border: "1px solid #ccc", outline: "none", marginRight: "10px" }}
          />
          <button
            type="button"
            onClick={verify}
            disabled={verifying}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-3xl font-bold text-lg"
          >
            {verifying ? "Submitting" : "Submit OTP"}
          </button>
        </div>
      )}
    </form>
  );
}
