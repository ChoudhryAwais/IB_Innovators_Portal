import React, { useState, useEffect, useContext } from "react";

import { db } from "../../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";
import { ContactInformation } from "./ContactInformation";
import { Education } from "./Education";
import { YourSupport } from "./YourSupport";
import { RevisionCourses } from "./RevisionCourses";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function Profile({userDetails, userId}) {


  const [curr, setCurr] = useState("Contact Information")

  return (



    <Accordion>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon />}
    aria-controls="panel1-content"
    id="panel1-header"
  >
      <div style={{ textAlign: "left", fontSize: '1.5rem', fontWeight: 'bold', flex: 1, textAlign: 'left' }}>Profile</div>
  </AccordionSummary>
  <AccordionDetails>
    
  <div style={{ flex: 1, textAlign: "center" }}>
        <h1>{userDetails?.userName}</h1>
      </div>
      <div
        style={{
          flex: 1,
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <button
          style={{
            padding: "3px 6px",
            backgroundColor: curr === "Contact Information" ? "#1976d2" : 'transparent',
            color: curr === "Contact Information" ? "white" : 'black',
            fontSize: "medium",
            borderRadius: "5px",
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={() => {setCurr("Contact Information")}}
        >
          Contact Information
        </button>

        <button
          style={{
            padding: "3px 6px",
            backgroundColor: curr === "Education" ? "#1976d2" : 'transparent',
            color: curr === "Education" ? "white" : 'black',
            fontSize: "medium",
            borderRadius: "5px",
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={() => {setCurr("Education")}}
        >
          Education
        </button>

        <button
          style={{
            padding: "3px 6px",
            backgroundColor: curr === "Your Support" ? "#1976d2" : 'transparent',
            color: curr === "Your Support" ? "white" : 'black',
            fontSize: "medium",
            borderRadius: "5px",
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={() => {setCurr("Your Support")}}
        >
          Your Support
        </button>

        <button
          style={{
            padding: "3px 6px",
            backgroundColor: curr === "Revision Courses" ? "#1976d2" : 'transparent',
            color: curr === "Revision Courses" ? "white" : 'black',
            fontSize: "medium",
            borderRadius: "5px",
            transition: 'all 0.3s ease-in-out'
          }}
          onClick={() => {setCurr("Revision Courses")}}
        >
          Revision Courses
        </button>
      </div>

      <div style={{marginTop: '15px', padding: '10px', border: '1px solid #ccc'}}>
          {curr==="Contact Information" && <ContactInformation userDetails={userDetails} userId={userId} />}
          {curr==="Education" && <Education userDetails={userDetails} userId={userId} />}
          {curr==="Your Support" && <YourSupport userDetails={userDetails} userId={userId} />}
          {curr==="Revision Courses" && <RevisionCourses userDetails={userDetails} userId={userId} />}
      </div>

  </AccordionDetails>
</Accordion>
  );
}
