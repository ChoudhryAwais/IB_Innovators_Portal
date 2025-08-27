import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  getDoc,
  updateDoc
} from "firebase/firestore";
import styles from "./CoursesEnrolled.module.css";

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CoursesEnrolled = () => {
  const [data, setData] = useState([]);
  const { userDetails } = useContext(MyContext);


  const fetchData = () => {
    const ordersRef = collection(db, "Linked");
    const q = query(ordersRef, where("studentId", "==", userDetails?.userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push(doc.data());
      });
      setData(fetchedData);
    });

    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    fetchData();
  }, [])


  return (
    <>
      <h2 style={{ textAlign: "left" }}>Enrolled Courses</h2>
      <div className={styles.courseList}>
        {data.map((course, index) => (

<Accordion key={index}>
<AccordionSummary
  expandIcon={<ExpandMoreIcon />}
  aria-controls="panel1-content"
  id="panel1-header"
>
  <div style={{flex: 1, justifyContent: 'space-between', display: 'flex', fontSize: 'large', fontWeight: 'bold'}}>
    <div>
    {course.subject}
  </div>

  </div>
</AccordionSummary>
<AccordionDetails>
</AccordionDetails>
</Accordion>

        ))}

        
{data?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No courses enrolled
          </div>
        )}
      </div>

    </>
  );
};

export default CoursesEnrolled;
