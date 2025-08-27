import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
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

const CoursesEnrolled = () => {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null); // Track the expanded course
  const { isUserLoggedIn, userType, userId } = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate("/login", { replace: true });
    } else if (userType === "admin") {
      navigate("/", { replace: true });
    } else if (userType === "teacher") {
      navigate("/", { replace: true });
    } else {
      fetchData();
    }
  }, [isUserLoggedIn, userType]);

  const fetchData = () => {
    const myUserId = localStorage.getItem("userId");
    const ordersRef = collection(db, "Linked");
    const q = query(ordersRef, where("studentId", "==", myUserId));

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

  const toggleExpand = (index) => {
    if (expanded === index) {
      setExpanded(null);
    } else {
      setExpanded(index);
    }
  };

  const [selectedLink, setSelectedLink] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [credits, setCredits] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);


  useEffect(() => {
    if (Object.keys(selectedLink).length !== 0){
      setFinalAmount(credits*selectedLink?.price);
    }
  }, [credits, selectedLink])



  const handleModalSubmit = async () => {
    if (Object.keys(selectedLink).length !== 0 && finalAmount !==0) {
      const finalCredits = finalAmount/selectedLink?.price;
      await addCredits(selectedLink, finalCredits);
    }
    setShowModal(false);
    setCredits(0);
  };

  const addCredits = async (link, price) => {
    const docRef = doc(collection(db, "Linked"), link.id);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();
      const currentCredits = docData.credits || 0;

      await updateDoc(docRef, {
        credits: parseInt(currentCredits) + parseInt(price),
      });

      alert(`Credits added successfully`);
    } else {
      console.error("Document not found");
    }
  };


  return (
    <div style={{ padding: "1rem" }}>
      <div className={styles.mainHeader}>
        <h1>Enrolled Courses ({data.length})</h1>
      </div>
      <ul className={styles.courseList}>
        {data.map((course, index) => (
          <li key={index} style={{backgroundColor: course?.credits > 0 ? "#f4f4f4" : '#fcc3c3'}} className={styles.coursesContainer}>
            <div
              className={styles.courseTitle}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div
                onClick={() => toggleExpand(index)}
                style={{ flex: 1, display: "flex", alignItems: "center" }}
              >
                {course.subject} {<span style={{marginLeft: '15px', fontSize: 'large', color: 'red'}}>Current Credits: {course?.credits}</span>}
              </div>{" "}
              <button onClick={() => {
                setShowModal(true);
                setSelectedLink(course)
              }}>Buy Credits</button>
            </div>

            {expanded === index && (
              <div className={styles.courseDetails}>
                <p>Teacher Name: {course.teacherName}</p>
                <p>Hourly Rate: ${course.price}</p>
                <p>Subject: {course.subject}</p>
                {/* Add more details as needed */}
              </div>
            )}
          </li>
        ))}
      </ul>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // center the modal content vertically and horizontally
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2>Enter Credits to Buy</h2>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="Enter Credits"
              min={0}
              style={{
                width: "100%",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />

<h2 style={{border: '1px solid #ccc', padding: '10px', color: finalAmount>0 ? 'red' : "black", marginTop: '1rem', borderRadius: '10px'}}>Total Amount: £ {finalAmount}</h2>
            
            <div style={{ flexDirection: "row", display: "flex" }}>
              <button
                onClick={handleModalSubmit}
                style={{
                  marginRight: "10px",
                  padding: "10px 15px",
                  width: "100%",
                }}
              >
                Buy
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                setCredits(0)}}
                style={{ padding: "10px 15px", width: "100%" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesEnrolled;
