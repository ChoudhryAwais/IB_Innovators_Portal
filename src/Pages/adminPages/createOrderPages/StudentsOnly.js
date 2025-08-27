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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import { CreateNewOrderForm } from "./CreateNewOrderForm";

export function StudentsOnly() {
  const { userDetails } = useContext(MyContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({})

  const [subjects, setSubjects] = useState(
    userDetails?.subjects ? userDetails?.subjects : {}
  );

  function closingModal(e) {
    setShowModal(e);
  }

  const [students, setStudents] = useState([]);

  const fetchData = () => {
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("type", "==", "student"));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studentData = querySnapshot.docs.map((doc) => doc.data());
        // console.log(studentData);
        setStudents(studentData);
        setSearchedStudents(studentData);
      });
  
      return unsubscribe; // Return the unsubscribe function to stop listening when the component unmounts
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };
  
  useEffect(() => {
    const unsubscribe = fetchData();
  
    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array to run the effect only once when the component mounts
  

  const [searchedStudents, setSearchedStudents] = useState(students);

  function handleSearch(e) {
    const searchedData = e.target.value.toLowerCase();

    if (searchedData.length >= 2) {
      setSearchedStudents(
        students.filter((item) => {
          return (
            item?.userName.toLowerCase().includes(searchedData) ||
            item?.email.toLowerCase().includes(searchedData) ||
            item?.userId.toLowerCase().includes(searchedData)
          );
        })
      );
    } else {
      setSearchedStudents(students);
    }
  }

  // PAST LESSONS PAGINATION
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = searchedStudents?.slice(startIndex, endIndex);

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
      marginBottom: '10px'
    }}
    >
      <h2 style={{ textAlign: "left" }}>Students</h2>

      {students.length !== 0 &&
      <div
        style={{
          marginBottom: "10px",
          marginTop: "20px",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "2px solid #ccc",
        }}
      >
        <FontAwesomeIcon
          style={{ marginLeft: "10px", marginRight: "10px" }}
          icon={faMagnifyingGlass}
        />
        <input
          onChange={handleSearch}
          placeholder="Search via Name / Email / User ID"
          style={{ border: "none", flex: 1, outline: "none", background: 'transparent' }}
          defaultValue=""
        />
      </div>
      }

      {displayedSessions.map((student, index) => (
        <div
          style={{
            flex: 1,
            padding: "10px",
            borderTop: index!== 0 ? "2px solid #fff" : 'none',
          }}
          key={index}
        >
          <div style={{ fontWeight: "bold" }}>{student?.userName}</div>
          <div>Email: {student?.email}</div>
          <div>User ID: {student?.userId}</div>
          <div>Balance: £ {(student?.credits && student?.credits > 0) ? student?.credits?.toFixed(2) : 0}</div>

          <Button variant="outlined"
            style={{
              width: '100%',
              marginTop: '5px',
              marginBottom: '5px'
            }}
            onClick={() => {
              setSelectedStudent(student);
              setShowModal(true);
            }}
          >
            CREATE JOB
          </Button>
        </div>
      ))}

      {searchedStudents?.length > itemsPerPage && (
        <div
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            marginTop: "20px",
            marginBottom: "10px",
          }}
        >
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(students?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {searchedStudents.length === 0 && (
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#ccc",
            fontSize: "1.5rem",
          }}
        >
          No Students
        </div>
      )}

      <Modal
        open={showModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CreateNewOrderForm item={selectedStudent} handleClose={closingModal} />
      </Modal>
    </div>
  );
}