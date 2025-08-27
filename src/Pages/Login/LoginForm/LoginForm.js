import React, { useRef, useState, useEffect } from "react";
import classes from "./LoginForm.module.css";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import CustomModal from "../CustomModal/CustomModal";
import Loader from "../Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { MyContext } from "../../../Context/MyContext";
import { useContext } from "react";
import moment from 'moment-timezone';
import { toast } from "react-hot-toast";


import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  getMultiFactorResolver
} from "firebase/auth";

import OtpInput from 'react-otp-input';
import { TextField } from "@material-ui/core";


export default function LoginForm() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef();
  const emailRef = useRef();
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const timeZone = moment.tz.guess();

  
  const [resolver, setResolver] = useState(null);

  // STATE TO STORE DATA FETCHED FROM FIRESTORE DATABASE
  
  
  const {
    setIsUserLoggedIn,
    setUserDetails,
    setUserType,
  } = useContext(MyContext);


  // SHOW / HIDE PASSWORD
  function toggleShowPassword() {
    setShowPassword((prev) => !prev);
  }

  // VALIDATION CHECK
  function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }
  function isValidPassword(password) {
    return password.length >= 8;
  }

  // HANDLE ERRORS
  function handleEmailBlur() {
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
    }
  }
  function handlePasswordBlur() {
    if (loginData.password === "") {
      setPasswordError("Please enter your password.");
    } 
    // else if (!isValidPassword(loginData.password)) {
    //   setPasswordError(
    //     "Please enter your password containing min 8 characters."
    //   );
    // }
  }

  // HANDLE INPUT
  function handleEmailInput(e) {
    let value = e.target.value;
    setLoginData((prev) => ({ ...prev, email: value }));
    setEmailError("");
    setFormError("");
    setNotification("");
  }
  function handlePasswordInput(e) {
    let value = e.target.value;
    setLoginData((prev) => ({ ...prev, password: value }));
    setPasswordError("");
    setFormError("");
    setNotification("");
  }

  // FOCUS ON CLICK
  function focusEmail() {
    emailRef.current.focus();
  }

  function focusPassword() {
    passwordRef.current.focus();
  }

  // FORGOT PASSWORD
  async function forgotPassword() {
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
      return;
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      try {
        await sendPasswordResetEmail(auth, loginData.email);
        setNotification(
          "A password reset email has been sent to your email address. Please reset your password and then log in."
        );
      } catch (e) {
        setFormError(e.message);
      }
    }
  }

  // HANDLE SUBMIT EMAIL AND PASSWORD
  async function handleSubmit(e) {
    e.preventDefault();
    if (loginData.email === "") {
      setEmailError("Please enter your email address.");
      return;
    } else if (!isValidEmail(loginData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else if (loginData.password === "") {
      setPasswordError("Please enter your password.");
      return;
    } else if (!isValidPassword(loginData.password)) {
      setPasswordError(
        "Please enter your password containing min 8 characters."
      );
      return;
    } else {
      try {
        setLoading(true);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
        );

        // EMAIL VERIFICATION
      //   if(!userCredential.user.emailVerified){
      //     try{
      //     await sendEmailVerification(userCredential.user)
      //     toast.success("Verification email sent. Please verify to enable 2FA.")
      // } catch(e){
      //     console.error(e)
      // }
      // } 

        const userId = userCredential.user.uid;
        const docRef = doc(db, "userList", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
    // sessionStorage.setItem("sessionStart", Date.now());
          setUserDetails(docSnap.data());
          setIsUserLoggedIn(true);
          setUserType(docSnap.data()?.type)
          updateDoc(docRef, {timeZone: timeZone})
        } else {
          setFormError(
            "You currently don't have an account. Please register to proceed."
          );
        }
      } catch (error) {
        setFormError(error.code);

        if (error.code === "auth/multi-factor-auth-required") {
          setResolver(getMultiFactorResolver(auth, error))
          // console.log("getMultiFactorResolver(auth, error)", getMultiFactorResolver(auth, error))
        }

        console.error(error);
      } finally{
        setLoading(false);
      }
    }
  }

  
    // ___________________OTP_________________________

    

    const [otp, setOtp] = useState(null);
    const [verification, setverification]=useState(null);
    const [show, setShow] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [sending, setSending] = useState(false);

    
      const handleChange = (newValue) => {
        setOtp(newValue)
      }

    const sendOtp = async () => {
      setSending(true);
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
            // console.log('recaptcha resolved..')
        }
    });
      recaptchaVerifier.render();

      const phoneOpts = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session,
      };
  
      const phoneAuthProvider = new PhoneAuthProvider(auth);
  
      await phoneAuthProvider
        .verifyPhoneNumber(phoneOpts, recaptchaVerifier)
        .then((verificationId) => {
          setverification(verificationId);
          setShow(true);
        });
        
      setSending(false);
    };


    const verify = async (e) => {
      e.preventDefault();
      setVerifying(true);
      try {
        //pass the user endtered otp
        const cred = PhoneAuthProvider.credential(verification, otp);
  
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
  
        const credential = await resolver
          .resolveSignIn(multiFactorAssertion)
          .then((enrollment) => {
            // auth.onAuthStateChanged(async (users) => {
            //   if (users) {
            //     navigate("/");
            //     onClose();
            //   }
            // });
          });
          setVerifying(false);
      } catch (err) {
        setVerifying(false);
        toast.error("Invalid OTP");
      }
    };

    useEffect(() => {
      if(resolver?.hints[0]){
      sendOtp()
    }
    }, [resolver])










    
  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 455); // You can adjust the width threshold as needed
  };

  useEffect(() => {
    checkIsMobile(); // Initial check
    window.addEventListener("resize", checkIsMobile); // Add event listener

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);


  return (
    <form onSubmit={handleSubmit} className={classes.form}>

      {
        formError !== "auth/multi-factor-auth-required" 
        ?

        <>
      <div className={classes.fieldsContainer}>
        {/* EMAIL INPUT */}
        <div>
          <label>Email</label>
          <div
            onClick={focusEmail}
            onBlur={handleEmailBlur}
            style={{ borderColor: emailError !== "" ? "red" : "#9e9e9e" }}
            className={classes.fieldContainer}
          >
            <input
              style={{ borderColor: emailError !== "" ? "red" : "#9e9e9e" }}
              onChange={handleEmailInput}
              placeholder="johndoe@example.com"
              ref={emailRef}
            />
          </div>
          {emailError !== "" && (
            <div className={classes.error}>{emailError}</div>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <label>Password</label>
          <div
            onClick={focusPassword}
            onBlur={handlePasswordBlur}
            style={{ borderColor: passwordError !== "" ? "red" : "#9e9e9e" }}
            className={classes.fieldContainer}
          >
            <input
              onChange={handlePasswordInput}
              placeholder="********"
              type={showPassword ? "text" : "password"}
              ref={passwordRef}
            />
            {showPassword ? (
              <FontAwesomeIcon
                icon={faEyeSlash}
                onClick={toggleShowPassword}
                className={classes.eyeLogo}
              />
            ) : (
              <FontAwesomeIcon
                icon={faEye}
                onClick={toggleShowPassword}
                className={classes.eyeLogo}
              />
            )}
          </div>
          {passwordError !== "" && (
            <div className={classes.error}>{passwordError}</div>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD */}
      <div className={classes.forgotPasswordContainer}>
        <button
          onClick={forgotPassword}
          type="button"
          className={classes.forgotPassword}
        >
          Forgot Password?
        </button>
      </div>
      {/* NOTIFICATION */}
      {notification !== "" && (
        <div className={classes.notification}>{notification}</div>
      )}
      {/* SUBMIT BUTTON */}
      <button disabled={loading} type="submit" className={classes.actionButton}>
        {loading ? "Logging In" : "Login"}
      </button>

      {/* FORM ERROR */}
      {formError !== "" && <div className={classes.error}>{formError}</div>}
      </>
      :
        <>
        

        <div className={classes.otpContainer}>
              <OtpInput
      value={otp}
      onChange={setOtp}
      numInputs={6}
      renderSeparator={<span>{" "}</span>}
      inputStyle={{width: "100%", maxWidth: '50px', height: "70px", borderRadius: '10px', border: '1px solid #ccc', outlined: 'none', marginRight: '10px'}}
      renderInput={(props) => <input type="number" {...props} />}
    />
          </div>
            <div style={{ marginTop: "1rem", paddingBottom: 0 }}>
              <button
                onClick={verify}
                disabled={verifying}
                className={classes.actionButton}
              >
                {verifying ? "Submitting" : "Submit OTP"}
              </button>
            </div>
        </>
      
    }

    </form>
  );
}
