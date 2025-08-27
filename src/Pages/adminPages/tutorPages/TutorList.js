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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';

export function TutorList({selectedTutor, setSelectedTutor}) {

  const [students, setStudents] = useState([]);

  const [selected, setSelected] = useState({});



  const fetchData = async () => {
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("type", "==", "teacher"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tutorData = querySnapshot.docs.map((doc) => doc.data());
        setStudents(tutorData);
        setSearchedStudents(tutorData);


        if (selected) {
          const updatedTutor = tutorData.find(
            (tutor) => tutor.userId === selected.userId
          );
          if (updatedTutor) {
            setSelectedTutor(updatedTutor);
            setSelected(updatedTutor)
          }
        }
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
  }, []);
  

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
      <h2 style={{ textAlign: "left" }}>Tutors</h2>

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
            borderTop: index !== 0 ? "2px solid #ccc" : 'none',
          }}
          key={index}
        >
          <div style={{ fontWeight: "bold" }}>{student?.userName}</div>
          <div>Email: {student?.email}</div>
          <div>User ID: {student?.userId}</div>

          <Button variant="outlined"
            onClick={() => {
              setSelectedTutor(student);
              setSelected(student)
            }}
            style={{flex: 1, marginBottom: '5px', marginTop: '5px', width: '100%'}}
          >
            SELECT
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
          No Tutors
        </div>
      )}

    </div>
  );
}
