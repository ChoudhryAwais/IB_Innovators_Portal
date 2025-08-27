import React, { useState } from "react";
import classes from "./Login.module.css";
import googleLogo from "../../assets/R.png";

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  getDocs,
  where,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import CustomModal from "./CustomModal/CustomModal";
import Loader from "./Loader/Loader";
import LoginForm from "./LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import { useContext } from "react";
import Logo from "../../assets/logo.png";
import moment from "moment-timezone";

export default function Login() {
  const auth = getAuth();
  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setIsUserLoggedIn, setUserDetails, setUserType } =
    useContext(MyContext);

  const timeZone = moment.tz.guess();

  // SIGN IN WITH GOOGLE
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userId = userCredential.user.uid;
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size === 1) {
        querySnapshot.forEach((doc) => {
          const userType = doc.data().type;
          const userData = doc.data();
          setIsUserLoggedIn(true);
          setUserDetails(userData);
          setUserType(userType);
          const docRef = doc(db, "userList", doc.id);
          updateDoc(docRef, { timeZone: timeZone });
        });
        navigate("/", { replace: true });
      } else {
        toast.error("User doesn't exist.");
      }
    } catch (error) {
      toast.error("Error logging in user");
    } finally {
      setLoading(false);
    }
  };


  // ______________________________________________________________________________


  
  return (
    <div className={classes.container}>
      <div className={classes.innerContainer}>
        {/* FORM CONTAINER */}
        <div className={classes.formContainer}>
          <div className={classes.loginContainer}>
            {/* LOGO IMAGE */}
            <div
              style={{
                margin: "0px auto",
                width: "max-content",
                marginBottom: "50px",
              }}
            >
              <img
                src={Logo}
                alt=""
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "contain",
                  maxWidth: "200px",
                }}
              />
            </div>

            {/* TOP HEADINGS */}
            <div className={classes.formHeading}>Login</div>
            <div style={{marginBottom: '30px'}} className={classes.formDescription}>
              Please enter your login credentials below.
            </div>

            {/* LOGIN WITH GOOGLE */}
            
            {/* <button
              disabled={loading}
              onClick={loginWithGoogle}
              className={classes.signInWithGoogleButton}
            >
              <div
                style={{
                  height: "25px",
                  width: "25px",
                  backgroundImage: `url(${googleLogo})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              <div>{loading ? "Signing" : "Sign"} in with Google</div>
            </button>
            {formError !== "" && (
              <div className={classes.error}>{formError}</div>
            )}
*/}
            <LoginForm />

            {/* @2024 LINE */}
            <div className={classes.endLine}>
              @2024 IB Innovators. All rights reserved
            </div>
          </div>
        </div>

        {/* IMAGE CONTAINER */}
        <div className={classes.imageContainer}>
          <div className={classes.backgroundLogoImage}></div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
