import React, { useEffect, useState, useContext } from "react";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styles from "./StudentMyTeachers.module.css";
import { MyContext } from "../../../Context/MyContext";

import Button from "@mui/material/Button";
import { Modal } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";

import toast from "react-hot-toast";

export default function StudentMyTeachers() {
  const [students, setStudents] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const {userDetails} = useContext(MyContext);


  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setFetchingData(true);

      const linkedRef = collection(db, "Linked");
      const q = query(linkedRef, where("studentId", "==", userDetails?.userId));

      // Listen to the query snapshot changes
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const updatedStudents = [];
        const deactivatedStudents = [];

        // Collect student data from Linked collection
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.studentDeactivated) {
            deactivatedStudents.push({ ...data });
          } else {
            updatedStudents.push({ ...data });
          }
        });
        // Set the state with the updated student data
        if (updatedStudents.length === 0) {
          setFetchingData(false);
        }
        setStudents(updatedStudents?.slice(0, 2));
        setLoading(false);
      });
      return () => {
        // Unsubscribe from the snapshot listener when the component unmounts
        unsubscribe();
      };
    };
    fetchData();
  }, []);

  const [firstStudent, setFirstStudent] = useState({});
  const [secondStudent, setSecondStudent] = useState({});

  useEffect(() => {
    if (students.length !== 0) {
      if (students.length === 1) {
        const firstStudent = students[0];

        setFirstStudent(firstStudent);
      }

      if (students.length === 2) {
        const firstStudent = students[0];
        const secondStudent = students[1];
        setFirstStudent(firstStudent);
        setSecondStudent(secondStudent);
      }
    }
  }, [students]);

  return (
    <div style={{ flex: 1 }}>
      <div
        className="shadowAndBorder"
        style={{
          height: "max-content",
          marginBottom: "10px",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ textAlign: "left" }}>My Subscriptions</h2>
        {loading ? (
          <div
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            {students.length === 1 && (
              // FIRST STUDENT DATA
              <div
                className={styles.teachersContainer}
                style={{ borderBottom: "none" }}
              >
                <div className={styles.subjects}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                      {firstStudent?.teacherName}
                    </span>{" "}
                    <br />
                    <span>Subscription# {firstStudent?.id}</span>{" "}
                    <br />
                    <span>Subject: {firstStudent?.subject}</span>{" "}
                    {/* <br />
                    <span>Hourly Rate: £ {firstStudent?.price}</span>{" "} */}
                  </div>
                </div>
              </div>
            )}

            {students.length === 2 && (
              <>
                {/* // FIRST STUDENT DATA */}
                <div className={styles.teachersContainer}>
                  <div className={styles.subjects}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {firstStudent?.teacherName}
                      </span>{" "}
                      
                    <br />
                    <span>Subscription# {firstStudent?.id}</span>{" "}
                    <br />
                    <span>Subject: {firstStudent?.subject}</span>{" "}
                      {/* <br />
                      <span>Hourly Rate: £ {firstStudent?.price}</span>{" "} */}
                    </div>
                  </div>
                </div>

                {/* // SECOND STUDENT DATA */}
                <div
                  style={{ borderBottom: "none" }}
                  className={styles.teachersContainer}
                >
                  <div className={styles.subjects}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {secondStudent?.teacherName}
                      </span>{" "}
                    <br />
                    <span>Subscription# {firstStudent?.id}</span>{" "}
                    <br />
                    <span>Subject: {firstStudent?.subject}</span>{" "}
                      {/* <br />
                      <span>Hourly Rate: £ {secondStudent?.price}</span>{" "} */}
                    </div>
                  </div>
                </div>
              </>
            )}

            {students?.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: "#ccc",
                  fontSize: "1.5rem",
                }}
              >
                No Teachers
              </div>
            ) : (
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  navigate("/mySubscriptions");
                }}
                variant="outlined"
              >
                VIEW MY SUBSCRIPTIONS
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
