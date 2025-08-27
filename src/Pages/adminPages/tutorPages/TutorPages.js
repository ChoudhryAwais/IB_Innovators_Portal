import React, { useEffect, useState } from "react";
import styles from "./TutorPages.module.css";
import { Profile } from "./profileAndFinance/Profile";
import { AddSubjectsApplication } from "./AddSubjectsApplication";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { Modal } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../../firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import TeacherInvoices from "./profileAndFinance/TeacherInvoices";
import { ManageSubjects } from "./ManageSubjects";
import TopHeading from "../../../Components/TopHeading/TopHeading";
import LinkedStudentsList from "./LinkedStudentsList/LinkedStudentsList";

export const TutorPages = () => {
  const [selectedTutor, setSelectedTutor] = useState({});
  const [showModal, setShowModal] = useState(false);

  const [students, setStudents] = useState([]);

  const [searchedStudents, setSearchedStudents] = useState(students);

  // TUTOR LIST PAGES

  useEffect(() => {
    let unsubscribe;

    const fetchData = async () => {
      try {
        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("type", "==", "teacher"));

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tutorData = querySnapshot.docs.map((doc) => doc.data());
          setStudents(tutorData);
          setSearchedStudents(tutorData);

          if (selectedTutor) {
            const updatedTutor = tutorData.find(
              (tutor) => tutor.userId === selectedTutor.userId
            );
            if (updatedTutor) {
              setSelectedTutor(updatedTutor);
            }
          }
        });
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };

    fetchData();

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
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
    <React.Fragment>
      <TopHeading>Manage Tutors & Subjects</TopHeading>

      <div className={styles.dashboardContainer}>
        <div
          className="shadowAndBorder"
          style={{
            marginTop: "0px",
            flex: 1,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: "rgba(255,255,255, 0.5)",
            backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
            WebkitBackdropFilter: "blur(4px)", // For Safari support,
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ textAlign: "left" }}>Tutors</h2>

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
                placeholder="Search via Name / Email / User ID"
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
              <div style={{ fontWeight: "bold" }}>{student?.userName}</div>
              <div>Email: {student?.email}</div>
              <div>User ID: {student?.userId}</div>

              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedTutor(student);
                  setShowModal(true);
                }}
                style={{
                  flex: 1,
                  marginBottom: "5px",
                  marginTop: "5px",
                  width: "100%",
                }}
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

        <ManageSubjects />
      </div>

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // center the modal content vertically and horizontally
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "90%",
              maxWidth: "1000px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: "rgba(255,255,255, 0.6)",
              backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
              WebkitBackdropFilter: "blur(4px)", // For Safari support,
              borderRadius: "10px",
            }}
          >
            <div style={{ padding: "10px", flex: 1, overflow: "auto" }}>
              <div
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
                <div
                  style={{
                    marginTop: "0px",
                    flex: 1,
                    height: "max-content",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                    background: "rgba(17, 17, 17, 0.9)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      flex: 1,
                      color: "#eee",
                    }}
                  >
                    {selectedTutor?.userName} ({selectedTutor?.email})
                  </div>
                </div>

                <Profile
                  userDetails={selectedTutor}
                  userId={selectedTutor.userId}
                />
                <AddSubjectsApplication
                  userDetails={selectedTutor}
                  userId={selectedTutor.userId}
                />

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
                      Earnings
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TeacherInvoices
                      userDetails={selectedTutor}
                      userId={selectedTutor.userId}
                    />
                  </AccordionDetails>
                </Accordion>
                <LinkedStudentsList userId={selectedTutor.userId} />
              </div>
            </div>
            <Button
              onClick={() => {
                setShowModal(false);
              }}
              variant="contained"
              color="error"
              style={{ margin: "10px" }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
};
