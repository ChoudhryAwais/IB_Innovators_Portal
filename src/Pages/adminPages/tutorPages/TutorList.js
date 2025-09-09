import React, { useState, useEffect } from "react";

import { db } from "../../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
} from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export function TutorList({ selectedTutor, setSelectedTutor }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState({});
  const [searchedStudents, setSearchedStudents] = useState(students);

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
            setSelected(updatedTutor);
          }
        }
      });

      return unsubscribe;
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => {
      unsubscribe();
    };
  }, []);

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
      className="mt-0 flex-1 h-max shadow-lg bg-white/50 backdrop-blur-md p-2.5 rounded-lg mb-2.5"
    >
      <h2 className="text-left">Tutors</h2>

      {students.length !== 0 && (
        <div className="my-5 flex flex-1 justify-center items-center border-b-2 border-gray-300">
          <FontAwesomeIcon className="mx-2.5" icon={faMagnifyingGlass} />
          <input
            onChange={handleSearch}
            placeholder="Search via Name / Email / User ID"
            className="border-none flex-1 outline-none bg-transparent"
            defaultValue=""
          />
        </div>
      )}

      {displayedSessions.map((student, index) => (
        <div
          className={`flex-1 p-2.5 ${
            index !== 0 ? "border-t-2 border-gray-300" : ""
          }`}
          key={index}
        >
          <div className="font-bold">{student?.userName}</div>
          <div>Email: {student?.email}</div>
          <div>User ID: {student?.userId}</div>

          <Button
            variant="outlined"
            onClick={() => {
              setSelectedTutor(student);
              setSelected(student);
            }}
            className="flex-1 mb-1.5 mt-1.5 w-full"
          >
            SELECT
          </Button>
        </div>
      ))}

      {searchedStudents?.length > itemsPerPage && (
        <div className="flex-1 flex items-center justify-center mt-5 mb-2.5">
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
        <div className="flex-1 text-center text-gray-300 text-2xl">
          No Tutors
        </div>
      )}
    </div>
  );
}
