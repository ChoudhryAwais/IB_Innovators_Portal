import React, { useState, useContext } from "react";
import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db, storage } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";



import Button from '@mui/material/Button';
import { Modal } from "@mui/material";

import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';

import toast from 'react-hot-toast';

export function AddSubjectModal({ item, handleClose }) {
  const [subjectsToBeClearedFor, setSubjectsToBeClearedFor] = useState("");
  const [describePreviousExperience, setDescribePreviousExperience] =
    useState("");
  const [proofOfGrade, setProofOfGrade] = useState(null);
  const [tutorName, setTutorName] = useState("");
  const { userDetails, addNotification, adminAddNotification } = useContext(MyContext);
  const [submitButtonText, setSubmitButtonText] = useState("SUBMIT");

  async function generateRandomFileName(file) {
    const uniqueIdentifier = Math.random().toString(36).substring(2, 15);

    // Use a function to extract the file extension
    const getFileExtension = (filename) => {
      const parts = filename.split(".");
      return parts.length > 1 ? parts.pop() : "";
    };

    const fileExtension = getFileExtension(file.name);
    return `${uniqueIdentifier}${file.name}.${fileExtension}`;
  }

  async function submittingForm() {
    if (
      subjectsToBeClearedFor === "" ||
      describePreviousExperience === "" ||
      tutorName === "" ||
      proofOfGrade === null
    ) {
      toast("Please fill all fields");
    } else {
      try {
        setSubmitButtonText("SUBMITTING...");
        const fileName = await generateRandomFileName(proofOfGrade);


        const storageRef = ref(storage, "teacherSubjects/" + fileName);
        await uploadBytes(storageRef, proofOfGrade);
        const downloadURL = await getDownloadURL(storageRef);

        const details = {
          subjectsToBeClearedFor,
          describePreviousExperience,
          tutorName,
          proofOfGrade: downloadURL,
          id: `${userDetails?.teacherSubjectApplication?.length}${Math.random().toString(36).substr(2, 10)}`
        };

        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userDetails?.userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;

          // Get the existing data from the document
          const existingData = (await getDoc(docRef)).data();

          // Check if teacherSubjectApplication array already exists
          if (existingData && existingData.teacherSubjectApplication) {
            // Append to the existing array
            const updatedArray = [
              ...existingData.teacherSubjectApplication,
              details,
            ];
            // Update the document with the merged data
            await setDoc(
              docRef,
              { teacherSubjectApplication: updatedArray },
              { merge: true }
            );
          } else {
            // Create a new array with the current details
            const newArray = [details];
            // Update the document with the new array
            await setDoc(
              docRef,
              { teacherSubjectApplication: newArray },
              { merge: true }
            );
          }
        }


        await addNotification(`You submitted application to add following subjects: ${subjectsToBeClearedFor}.`, userDetails.userId);
        await adminAddNotification(`${userDetails?.userName} submitted application to add following subjects: ${subjectsToBeClearedFor}.`, userDetails.userId);
         

        toast.success("Application Submitted");
        handleClose(false);
      } catch (e) {
        toast.error("Error submitting application");
        console.error(e)
        // alert("Error saving changes. Please try again");
      }
    }
  }

  return (
    <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // center the modal content vertically and horizontally
          }}
        >
        <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              minWidth: "70%",
              maxWidth: "1000px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: 'rgba(255,255,255, 0.6)',
              backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
              WebkitBackdropFilter: 'blur(4px)', // For Safari support,
              borderRadius: '10px',
              
            }}
          ><h2 style={{ textAlign: "left" }}>Apply for New Subject</h2>
        <div style={{
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.5)",
                  borderRadius: '10px',
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                  flex: 1
                }} >
          {/* Subjects to be cleared for */}
          <div style={{ flex: 1}}>
            <div>
              Which subjects do you wish to be cleared for?{" "}
              <span style={{ color: "red" }}>*</span>
            </div>
            <input
              value={subjectsToBeClearedFor}
              placeholder="Enter subjects here"
              style={{
                flex: 1,
                width: "100%",
                padding: "10px",
                background: "rgba(255,255,255,0.3)",
                outline: "none",
                border: "1px solid #aeaeae",
                borderRadius: '5px'
              }}
              onChange={(e) => {
                setSubjectsToBeClearedFor(e.target.value);
              }}
            />
          </div>

          {/* describe your previous experience */}
          <div style={{ flex: 1, marginTop: "20px" }}>
            <div>
              Please describe your previous experience, including grade{" "}
              <span style={{ color: "red" }}>*</span>
            </div>
            <textarea
              value={describePreviousExperience}
              placeholder="Enter details here"
              style={{
                flex: 1,
                width: "100%",
                padding: "10px",
                background: "rgba(255,255,255,0.3)",
                outline: "none",
                border: "1px solid #aeaeae",
                borderRadius: '5px'
              }}
              onChange={(e) => {
                setDescribePreviousExperience(e.target.value);
              }}
            />
          </div>

          {/* Subjects to be cleared for */}
          <div style={{ flex: 1, marginTop: "20px" }}>
            <div>
              Proof of grade <span style={{ color: "red" }}>*</span>
            </div>
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .pdf, .doc" // Specify the accepted file types if needed
              style={{
                flex: 1,
                width: "100%",
                padding: "10px",
                background: "rgba(255,255,255,0.3)",
                outline: "none",
                border: "1px solid #aeaeae",
                borderRadius: '5px'
              }}
              onChange={(e) => setProofOfGrade(e.target.files[0])}
            />
          </div>

          {/* Subjects to be cleared for */}
          <div style={{ flex: 1, marginBottom: "5px", marginTop: "20px" }}>
            <div>
              Tutor Name <span style={{ color: "red" }}>*</span>
            </div>
            <input
              value={tutorName}
              placeholder="Enter subjects here"
              style={{
                flex: 1,
                width: "100%",
                padding: "10px",
                background: "rgba(255,255,255,0.3)",
                outline: "none",
                border: "1px solid #aeaeae",
                borderRadius: '5px'
              }}
              onChange={(e) => {
                setTutorName(e.target.value);
              }}
            />
          </div>
        </div>





        <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "10px",
                    width: '100%',
                    marginTop: '20px'
                  }}
                >
                  <Button variant="outlined" color="error" 
            onClick={() => {
              handleClose(false);
            }}>
                  CANCEL
                </Button>
                { submitButtonText === "SUBMITTING..." ?
                <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="outlined"
              >
                SUBMITTING
              </LoadingButton>
              :
              <Button onClick={submittingForm}
              variant="contained" color="success">
                SUBMIT
                </Button>
                }
                
                
                  
                </div>

      </div>
    </div>
  );
}
