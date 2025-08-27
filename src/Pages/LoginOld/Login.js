import React, { useState, useContext, useEffect } from "react";
import styles from "./Login.module.css";
import {
  signInWithEmailAndPassword,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { collection, addDoc, getDocs, where, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../Context/MyContext";

import LoginImage from "../../assets/loginScreenImage.svg";
import LoginLogo from "../../assets/final logo-16.png";
import GoogleImage from "../../assets/R.png";
import { toast } from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    setUserDetails,
    setUserType
  } = useContext(MyContext);

  const loginWithUserId = async (userId) => {
    try {
      const userListRef = collection(db, 'userList');
      const q = query(userListRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size === 1) {
        querySnapshot.forEach((doc) => {
          const userType = doc.data().type;
          const userData = doc.data();
          setIsUserLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', userId);
          setUserDetails(userData);
          setUserType(userType);
        });
        console.log('User logged in successfully');
      } else {
        alert("User doesn't exist");
      }
    } catch (error) {
      console.error('Error logging in user: ', error);
      alert('Error logging in user');
    }
  };


  
  // useEffect(() => {
  //   const urlSearchParams = new URLSearchParams(window.location.search);
  //   const userIdParam = urlSearchParams.get('kl1m24k53km35n64l6m234l253n4kj6l7kml54kn767n36n34');
  //   const userParamSecond = urlSearchParams.get('mk532m235iou235o6hn4jn633j46n34j6n');
  
  //   console.log('userIdParam', userIdParam);



  //   if (userIdParam=="google") {
  //     loginWithGoogle();
  //   }
  //   else if (userIdParam && userParamSecond) {
  //     setLoginUserName(userIdParam);
  //     setLoginPassword(userParamSecond);
  //     LoginHandler(userIdParam, userParamSecond);
  //     // Manually set authentication state with the provided user ID
  //     // loginWithUserId(userIdParam);
  //   }
  // }, []); 

  useEffect(() => {

    // Get the hash fragment from the URL
const hashFragment = window.location.hash.substring(1);

// Parse the hash fragment into an object
const params = hashFragment.split('&').reduce((acc, param) => {
  const [key, value] = param.split('=');
  acc[key] = decodeURIComponent(value);
  return acc;
}, {});

// Access the username and password
const userIdParam = params.kl1m24k53km35n64l6m234l253n4kj6l7kml54kn767n36n34;
const userParamSecond = params.mk532m235iou235o6hn4jn633j46n34j6n;



    if (userIdParam=="google") {
      loginWithGoogle();
    }
    else if (userIdParam && userParamSecond) {
      setLoginUserName(userIdParam);
      setLoginPassword(userParamSecond);
      LoginHandler(userIdParam, userParamSecond);
      // Manually set authentication state with the provided user ID
      // loginWithUserId(userIdParam);
    }
  }, []); 

  

  // LOGIN STATES
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isUserLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isUserLoggedIn]);

  const LoginHandler = async (loginUserName, loginPassword) => {
    
    if (!loginUserName.trim()) {
      alert("Username is required");
    } else if (!loginPassword) {
      alert("Password is required");
    } else {
      try {
        setLoggingIn(true);
        const auth = getAuth();
        await signInWithEmailAndPassword(
          auth,
          loginUserName,
          loginPassword
        );
        // const userId = userCredential.user.uid;
        // const userListRef = collection(db, "userList");
        // const q = query(userListRef, where("userId", "==", userId));
        // const querySnapshot = await getDocs(q);

        // if (querySnapshot.size === 1) {
        //   querySnapshot.forEach((doc) => {
        //     const userType = doc.data().type;
        //     const userData = doc.data();
        //     localStorage.setItem("userId", userId);
        //     localStorage.setItem("isLoggedIn", "true");
        //     setIsUserLoggedIn(true);
        //     setUserDetails(userData);
        //     setUserType(userType);
        //   });
        //   navigate("/", { replace: true });
        //   console.log("User logged in successfully");
        // } else {
        //   alert("User doesn't exist");
        // }
      } catch (error) {
        console.error("Error logging in user: ", error);
        toast.error(error);
      } finally{
        setLoggingIn(false);
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
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
          localStorage.setItem("userId", userId);
          localStorage.setItem("isLoggedIn", "true");
          setIsUserLoggedIn(true);
          setUserDetails(userData);
          setUserType(userType);
        });
        navigate("/", { replace: true });
      } else {
        alert("User doesn't exist.");
      }
      console.log("User logged in successfully with Google");
    } catch (error) {
      console.error("Error logging in user with Google: ", error);
      alert("Error logging in user with Google");
    }
  };

  const LogInOtherMethods = (props) => (
    <div className={styles.alternativeLogin}>
      <label>Or Log In with:</label>
      <div className={styles.iconGroup}>
        <Google onClick={loginWithGoogle} />
      </div>
    </div>
  );

  const Google = (props) => (
    <a
      style={{ cursor: "pointer" }}
      onClick={props.onClick}
      className={styles.googleIcon}
    ></a>
  );


  const handleForgotPassword = async () => {
    if (loginUserName !== ""){
    try {
        const auth = getAuth(); // Import getAuth from firebase/auth if needed

        // Send password reset email
        await sendPasswordResetEmail(auth, loginUserName);

        // Inform the user that the password reset email has been sent
        alert("Password reset email sent. Please check your email inbox.");
    } catch (error) {
        console.error("Error sending password reset email: ", error);
        alert("Error sending password reset email");
    }
  } else {alert("Please Enter Email")}
};


  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 1200); // You can adjust the width threshold as needed
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
    <div className={styles.backgroundColor}>
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <div
        style={{
          height: "max-content",
          flex: 1,
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          borderRadius: "10px",
          margin: isMobile ? "3vh" : "5vh",
          overflow: 'hidden'
        }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              height: "100%",
            }}
          >
            {!isMobile && (
              <div
                style={{
                  flex: 1,
                  background: 'rgb(61, 121, 176, 0.5)',
                  alignItems: "center",
                  display: 'flex',
                  justifyContent: 'center'

                }}
              >
                <img
                  style={{
                    width: "100%",
                    maxHeight: "100%",
                    alignSelf: "center",
                  }}
                  src={LoginImage}
                  alt="Image"
                />{" "}
                {/* Added maxHeight and alignSelf */}
              </div>
            )}

            {/* FORM */}
            <div
              style={{
                flex: 1,
                paddingLeft: '10px',
                paddingRight: '10px'
              }}
              className={styles.loginform}
            >
              <img src={LoginLogo} alt="Logo" style={{ height: "3rem", objectFit: 'contain' }} />{" "}
              {/* Center image using margin auto */}
              <h2
                style={{
                  color: "#912d27",
                  fontWeight: "bold",
                  paddingBottom: "10px",
                  paddingTop: "10px",
                }}
                className={styles.headerTitle}
              >
                Welcome
              </h2>
              <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
                Please enter your Log-in Details
              </p>
              {/* <FormHeader title={isLogin ? 'LogIn' : 'SignUp'} /> */}


              <form
        style={{ width: "100%", padding: "10px 20px" }}
      >
        <div className={styles.row}>
          <div
            style={{
              textAlign: "left",
              width: "100%",
              margin: "10px 10px",
              color: "rgba(14, 56, 136, 0.7)",
              fontWeight: "bold",
              fontSize: "1.15rem",
            }}
          >
            Email
          </div>
          <input
            onChange={(e) => setLoginUserName(e.target.value)}
            value={loginUserName}
            placeholder="Enter email address"
            type="text"
            style={{border: 'none', borderRadius: '0px'}}
          />
        </div>

        <div className={styles.row}>
          <div
            style={{
              textAlign: "left",
              width: "100%",
              margin: "10px 10px",
              color: "rgba(14, 56, 136, 0.7)",
              fontWeight: "bold",
              fontSize: "1.15rem",
            }}
          >
            Password
          </div>
          <input
            onChange={(e) => setLoginPassword(e.target.value)}
            value={loginPassword}
            placeholder="Enter your password"
            type="password"
            style={{border: 'none', borderRadius: '0px'}}
          />
        </div>

        <div>
          <div
            style={{
              textAlign: "right",
              width: "100%",
              margin: "10px 10px",
              color: "#a81e1e",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: 'pointer'
            }}
            onClick={() => {handleForgotPassword()}}
          >
            Forgot Password?
          </div>
        </div>

        <div style={{ marginTop: "2rem", paddingBottom: 0 }}>
          <button
            disabled={loggingIn}
            onClick={() => {LoginHandler(loginUserName, loginPassword)}}
            className={styles.rowButton}
            style={{ textAlign: "center" }}
            type="button"
          >
            {
              loggingIn ? "Logging In" : "Log In"
            }
          </button>
        </div>

        <div style={{ marginTop: "1rem", paddingBottom: 0 }}>
        <button
  className={styles.rowButton}
  style={{
    textAlign: "center",
    color: "#1e1e1e",
    background: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  }}
  onClick={() => {loginWithGoogle(loginUserName, loginPassword)}}
  type="button"
>
  Login with <img style={{ transform: 'translateY(-10px)',height: "30px", objectFit: 'contain', marginLeft: '5px', width: 'auto' }} src={GoogleImage} alt="G" />oogle
</button>


        </div>
      </form>

              {/* <LoginForm /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
