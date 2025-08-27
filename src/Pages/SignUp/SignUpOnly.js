import React, { useState, useContext, useEffect } from "react";
import styles from "./SignUpOnly.module.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import LoginImage from '../../assets/loginScreenImage.jpg';
import LoginLogo from "../../assets/final logo-16.png";
import { toast } from "react-hot-toast";
import TopHeading from "../../Components/TopHeading/TopHeading";

function SignUpOnly() {
  const {
    isUserLoggedIn,
    userType,
    setIsUserLoggedIn,
    setUserDetails,
    setUserType
  } = useContext(MyContext);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [subjectsToTeach, setSubjectsToTeach] = useState("");
  const [myUserType, setMyUserType] = useState("admin");
  const [userName, setUserName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  const handleSignUpTypeChange = (e) => {
    setMyUserType(e.target.value);
  };


  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const SignUpHandler = async (e) => {
    e.preventDefault();
    if(confirmPassword !== signUpPassword){
      alert("Both Passwords do not match")
    } else if(!signUpEmail || !signUpPassword || !confirmPassword || !userName){
      alert("Please enter all details")
    }
     else {
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
          subjectsToTeach: subjectsToTeach,
          userName
        };
      } else {
        details = {
          userId,
          email: signUpEmail,
          type: myUserType,
          userName
        };
      }

      const userListRef = collection(db, "userList");
      await addDoc(userListRef, details);

      toast.success("User signed up successfully");
      setIsUserLoggedIn(true);
      setUserDetails({ email: signUpEmail, userId, type: userType });
      setUserType(myUserType);
      setSignUpEmail("");
      setSignUpPassword("");
      setSubjectsToTeach("");
      setConfirmPassword("");
      setUserName("");
      setMyUserType("student");
    } catch (error) {
      toast.error("Error signing up user");
    }
  }
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

  // return (
  //   <div className={styles.backgroundColor}>
  //     <div className={styles.loginform}>
  //       <h2 className={styles.headerTitle}>Register Admin</h2>

  //       <form onSubmit={SignUpHandler}>
  //         <div className={styles.row}>
  //           <label>Full Name</label>
  //           <input
  //             required
  //             type="text"
  //             placeholder="Enter Full Name"
  //             value={userName}
  //             onChange={(e) => setUserName(e.target.value)}
  //           />
  //         </div>

  //         <div className={styles.row}>
  //           <label>Email</label>
  //           <input
  //             required
  //             type="email"
  //             placeholder="Enter email address"
  //             value={signUpEmail}
  //             onChange={(e) => setSignUpEmail(e.target.value)}
  //           />
  //         </div>

  //         <div className={styles.row}>
  //           <label>Password</label>
  //           <input
  //             required
  //             type={showPassword ? "text" : "password"}
  //             placeholder="Enter your password"
  //             value={signUpPassword}
  //             onChange={(e) => setSignUpPassword(e.target.value)}
  //           />
  //         </div>

  //         {myUserType === "teacher" && (
  //           <div className={styles.row}>
  //             <label>Subjects to Teach</label>
  //             <input
  //               required
  //               type={"text"}
  //               placeholder="Separate with comma"
  //               value={subjectsToTeach}
  //               onChange={(e) => setSubjectsToTeach(e.target.value)}
  //             />
  //           </div>
  //         )}

  //         <div
  //           className={styles.row}
  //           style={{
  //             flexDirection: "row",
  //             alignItems: "center",
  //             justifyContent: "space-around",
  //             flex: 1
  //           }}
  //         >
  //         </div>

  //         <div style={{ padding: "2rem", paddingBottom: 0 }}>
  //           <button type="submit" className={styles.rowButton}>
  //             Register
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

  return(

    
    <div>
      <TopHeading>Admin SignUp</TopHeading>
        <div
    className="shadowAndBorder"
          style={{
            margin: '0px 10px 20px 0px',

            flex: 1,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: 'rgba(255,255,255, 0.5)',
            backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
            WebkitBackdropFilter: 'blur(4px)', // For Safari support,
            borderRadius: '10px', 
          }}
        >

          <div
            style={{
              display: "flex",
              flex: 1,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* FORM */}
            <div
              style={{
                flex: 1,
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // Center content horizontally
              }}
            >
              
    <form
        onSubmit={SignUpHandler}
        style={{ width: "100%" }}
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
            Full Name
          </div>
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            placeholder="Enter your full name"
            type="text"
            required
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
            Email
          </div>
          <input
            
              required
              type="email"
              placeholder="Enter email address"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
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
onChange={(e) => setSignUpPassword(e.target.value)}
value={signUpPassword}
placeholder="Enter your password"
type="password"
required
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
            Confirm Password
          </div>
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            placeholder="Re-Enter your password"
            type="password"
            required
          />
        </div>


        <div style={{ marginTop: "2rem", paddingBottom: 0 }}>
          <button
            type="submit"
            className={styles.rowButton}
            style={{ textAlign: "center" }}
          >
            Register
          </button>
        </div>

      </form>
            </div>
          </div>
        </div>
    </div>
    
  )
}

export default SignUpOnly;
