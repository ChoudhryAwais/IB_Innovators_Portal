import React, { useState, useEffect, useContext } from "react";
import { db } from "../../../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { MyContext } from "../../../Context/MyContext";
import {
  IconButton,
  Modal,
  Box,
  Typography,
  Button,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { CreateOrderForm } from "./CreateOrderForm";
import { StudentsOnly } from "./StudentsOnly";
import { Delete } from "@mui/icons-material";

export function StudentList() {
  const { userDetails } = useContext(MyContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [students, setStudents] = useState([]);
  const [searchedStudents, setSearchedStudents] = useState([]);

  const fetchData = () => {
    try {
      const userListRef = collection(db, "studentRequests");

      const unsubscribe = onSnapshot(userListRef, (querySnapshot) => {
        const studentData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
        setStudents(studentData);
        setSearchedStudents(studentData);
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
            item?.studentInformation?.userName
              ?.toLowerCase()
              .includes(searchedData) ||
            item?.studentInformation?.email
              ?.toLowerCase()
              .includes(searchedData) ||
            item?.studentInformation?.userId
              ?.toLowerCase()
              .includes(searchedData)
          );
        })
      );
    } else {
      setSearchedStudents(students);
    }
  }

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = searchedStudents?.slice(startIndex, endIndex);

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteDoc(doc(db, "studentRequests", studentToDelete.docId));
        setDeleteModalOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        className="shadowAndBorder"
        style={{
          marginTop: "0px",
          flex: 1,
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ textAlign: "left" }}>Course Requests</h2>

        {students.length !== 0 && (
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
              placeholder="Search via Name / Email"
              style={{
                border: "none",
                flex: 1,
                outline: "none",
                background: "transparent",
              }}
              defaultValue=""
            />
          </div>
        )}

        {displayedSessions.map((student, index) => (
          <div
            style={{
              flex: 1,
              padding: "10px",
              borderTop: index !== 0 ? "2px solid #ccc" : "none",
            }}
            key={index}
          >
            <div
              style={{
                fontWeight: "bold",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              {student?.studentInformation?.userName}
              <IconButton
                style={{ color: "darkred" }}
                onClick={() => {
                  setStudentToDelete(student);
                  setDeleteModalOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            </div>
            <div>Email: {student?.studentInformation?.email}</div>
            <div>Country: {student?.country}</div>
            <div>Course Requested: {student?.subject}</div>

            <Button
              variant="outlined"
              style={{
                width: "100%",
                marginTop: "5px",
                marginBottom: "5px",
              }}
              onClick={() => {
                setSelectedStudent(student);
                setShowModal(true);
              }}
            >
              VIEW & CREATE JOB
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
            No Requests
          </div>
        )}

        <Modal
          open={showModal}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
        >
          <CreateOrderForm item={selectedStudent} handleClose={setShowModal} />
        </Modal>

        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Confirm Deletion
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete this student request?
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>

      <StudentsOnly />
    </div>
  );
}
