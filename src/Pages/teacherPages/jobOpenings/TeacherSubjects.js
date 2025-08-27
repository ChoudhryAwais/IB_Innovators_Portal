import React, { useState, useEffect, useContext } from "react";

import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";
import { MyContext } from "../../../Context/MyContext";
import { Modal } from "@mui/material";
import { AddSubjectModal } from "./AddSubjectModal";
import Button from "@mui/material/Button";

export function TeacherSubjects() {
  const { userDetails } = useContext(MyContext);

  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState(userDetails?.subjects ? userDetails?.subjects : {});

  function closingModal(e) {
    setShowModal(e);
  }

  return (
    <div
    className="shadowAndBorder"
    style={{
      marginTop: "0px",
      flex: 1,
      height: "max-content",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
      background: 'rgba(255,255,255, 0.5)',
      backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
      WebkitBackdropFilter: 'blur(4px)', // For Safari support,
      padding: '10px',
      borderRadius: '10px', 
    }}
    >
      <h2 style={{ textAlign: "left" }}>My Subjects</h2>

      {subjects && Object.entries(subjects)
  .filter(([subject, value]) => value === true) // Filter subjects based on value being true
  .map(([subject], index) => (
    <div
      style={{
        textAlign: "center",
        flex: 1,
        padding: "10px",
        borderTop: index !== 0 ? "2px solid #fff" : "none",
      }}
      key={subject}
    >
      {subject}
    </div>
))}


{Object.entries(subjects)?.filter(([subject, value]) => value === true)?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#ccc",
              fontSize: "1.5rem",
            }}
          >
            No Subjects Yet
          </div>
        )}

      <Button style={{width: '100%', marginTop: '10px'}}
        variant="outlined"
        onClick={() => {setShowModal(true)}}
      >
        APPLY FOR NEW SUBJECT
      </Button>


      <Modal
  open={showModal}
  aria-labelledby="parent-modal-title"
  aria-describedby="parent-modal-description"
>
        <AddSubjectModal handleClose={closingModal} />
      </Modal>
    </div>
  );
}
