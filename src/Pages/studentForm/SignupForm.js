import React, { useState, useContext, useEffect } from "react";
import styles from "./SignUpOnly.module.css";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";


import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import toast from 'react-hot-toast';
import Button from '@mui/material/Button';


import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import emailjs from "emailjs-com";
import getStudentRegisterEmailTemplate from "../../Components/getEmailTemplate/getStudentRegisterEmailTemplate";

function SignupForm({student, setCreateAccountModal}) {
  const {
    isUserLoggedIn,
    userType,
    setIsUserLoggedIn,
    setUserDetails,
    setUserType
  } = useContext(MyContext);



  const [submitting, setSubmitting] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState(student?.userDetails?.email);
  const [signUpPassword, setSignUpPassword] = useState("Basic1234");
  const [showPassword, setShowPassword] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [subjectsToTeach, setSubjectsToTeach] = useState("");
  const [myUserType, setMyUserType] = useState("student");
  const [userName, setUserName] = useState(`${student?.userDetails?.firstName}${" "}${student?.userDetails?.lastName}`);
  const [hourlyRate, setHourlyRate] = useState("")

  const handleSignUpTypeChange = (e) => {
    setMyUserType(e.target.value);
  };
  const navigate = useNavigate();


  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };


  const SignUpHandler = async () => {
    setSubmitting(true)
    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );

      const userId = userCredential.user.uid;
      const userDetailsRef = doc(db, "userList", userId);
      
      let details = {
        userId,
        email: signUpEmail,
        type: myUserType,
        userName,
        otherInformation: student,
        credits: 0,
        phone: student?.userDetails?.phone || ""
      };
      
      await setDoc(userDetailsRef, details);


      
      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const emailUserId = process.env.REACT_APP_EMAILUSERID;


      const studentAndParentEmail = [signUpEmail, student?.userDetails?.parentEmail]
      const emailTemplate = getStudentRegisterEmailTemplate(userName, signUpEmail, signUpPassword);

      const emailParams = {
        from_name: "IBInnovators",
        to_name: "IBInnovators",
        send_to: studentAndParentEmail?.join(", "), 
        subject: "Your Student Portal Login Credentials",
        message: emailTemplate,
      };
      

      emailjs
      .send(serviceId, templateId, emailParams, emailUserId)
      .then((response) => {
      })
      .catch((error) => {
        console.error("Error sending email");
      });

      setSignUpEmail("");
      setSignUpPassword("");
      setSubjectsToTeach("");
      setMyUserType("student");
      setUserName("")
      setCreateAccountModal(false)
      toast.success("Account Registered");
    } catch (error) {
      toast.error("Error signing up user");
      console.error(error)
    } finally {
      setSubmitting(false)
    }
    
  };

  return (
    <div >
      <div >
        <h2 className={styles.headerTitle}>Register Student</h2>

        <form >
          <div style={{width: '100%'}}>
            <div style={{color: '#1e1e1e', textAlign: 'left', flex: 1, width: '100%'}}>Full Name</div>
            <input
              required
              type="text"
              placeholder="Enter Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{height: '50px',paddingLeft: '15px', width: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: '0px', outline: 'none', borderRadius: '5px', border: '1px solid #eee'}}
             />
          </div>


          <div style={{width: '100%', marginTop: '20px'}}>
            <div style={{color: '#1e1e1e', textAlign: 'left', flex: 1, width: '100%'}}>Email</div>
            <input
              required
              type="email"
              placeholder="Enter email address"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              style={{height: '50px',paddingLeft: '15px', width: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: '0px', outline: 'none', borderRadius: '5px', border: '1px solid #eee'}}
            />
          </div>

          <div style={{width: '100%', marginTop: '20px'}}>
            <div style={{color: '#1e1e1e', textAlign: 'left', flex: 1, width: '100%'}}>Password</div>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              style={{height: '50px',paddingLeft: '15px', width: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: '0px', outline: 'none', borderRadius: '5px', border: '1px solid #eee'}}
            
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
