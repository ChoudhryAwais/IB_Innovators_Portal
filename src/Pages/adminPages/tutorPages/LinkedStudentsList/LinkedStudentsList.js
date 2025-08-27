import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collection, getDocs, query, where, onSnapshot, getDoc, doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { db } from "../../../../firebase";
import StudentDetails from "./StudentDetails";

export default function LinkedStudentsList({userId}) {

    
    const [categorizedClasses, setCategorizedClasses] = useState({});
    
    useEffect(() => {
      const fetchData = async () => {
        if (userId) {
          const linkedRef = collection(db, "Linked");
          const q = query(linkedRef, where("teacherId", "==", userId));
  
          // Use onSnapshot to listen for real-time updates
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const classesByStudent = {};
            
            snapshot.forEach((doc) => {
              const data = doc.data();
              
              (data.invoices || []).forEach((invoice) => {
                const { studentId, studentName } = invoice;
  
                // If the student doesn't have an entry in classesByStudent, create one
                if (!classesByStudent[studentId]) {
                  classesByStudent[studentId] = {
                    studentName,
                    classes: []
                  };
                }
  
                // Add the current class to the student's array of classes
                classesByStudent[studentId].classes.push({ ...invoice, linkId: doc.id });
              });
            });
  
            setCategorizedClasses(classesByStudent);
          });
  
          // Clean up the listener when the component unmounts
          return () => unsubscribe();
        }
      };
  
      fetchData();
    }, [userId]);


  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <div
          style={{
            textAlign: "left",
            fontSize: "1.5rem",
            fontWeight: "bold",
            flex: 1,
            textAlign: "left",
          }}
        >
          Students
        </div>
      </AccordionSummary>
      <AccordionDetails>
      {Object.entries(categorizedClasses).map(([studentId, studentData]) => (
        
            
        
        <Accordion key={studentId}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          {studentData.studentName}
          
      </AccordionSummary>
      <AccordionDetails>
       <StudentDetails studentData={studentData} studentId={studentId} />
          
      </AccordionDetails>
    </Accordion>
      ))}
      </AccordionDetails>
    </Accordion>
  );
}
