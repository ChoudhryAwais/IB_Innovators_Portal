import React from "react";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  addDoc,
  where,
  query,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import "../studentForm/StudentForm.css";
import SignupForm from "./SignupForm";
import { Modal } from "@mui/material";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import ProcessedTutorForm from "./ProcessedTutorForm";
import CustomModal from "../../Components/CustomModal/CustomModal";
import TopHeading from "../../Components/TopHeading/TopHeading";
import { toast } from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TutorForm = () => {
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    setUserType,
    setUserDetails,
    userType,
  } = useContext(MyContext);
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]); // State to hold fetched data
  const [expanded, setExpanded] = useState(null);

  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "teacherForm");
    const orderCollectionRef = collection(customDocRef, "teacherForm");

    const orderedQuery = query(
      orderCollectionRef,
      orderBy("submittedAt", "desc")
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        setTutors(fetchedData);
      },
      (error) => {
        alert("Error fetching data: ", error);
      }
    );

    // Don't forget to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  };

  const toggleExpanded = (index) => {
    if (expanded === index) {
      setExpanded(null);
    } else {
      setExpanded(index);
    }
  };

  const handleProcessedClick = async (tutor) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "processedTutorForm");
      const orderCollectionRef = collection(customDocRef, "processedTutorForm");

      await addDoc(orderCollectionRef, { ...tutor, processedAt: new Date() });

      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "teacherForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "teacherForm"
      );

      const studentDocRef = doc(prevOrderCollectionRef, tutor.id);
      await deleteDoc(studentDocRef);

      setShowModal(false);
      toast.success("Marked as processed");
      // alert("Successfully processed teacher form");
    } catch (error) {
      toast.error("Error processing teacher form");
      console.error("Error processing teacher form: ", error);
    } finally {
      setLoading(false);
    }
  };

  // TUTOR FORM PAGINATION
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = tutors?.slice(startIndex, endIndex);

  function formatDateTime(timestampData) {
    // Convert Firestore timestamp to JavaScript Date object
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
    );

    // Format time as "hh:mm A"
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Format date as "DD/MM/YYYY"
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Combine formatted time and date
    const formattedDateTime = `${formattedTime} - ${formattedDate}`;

    return formattedDateTime;
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <TopHeading>Tutor Forms</TopHeading>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginRight: "10px",
        }}
      >
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
          <h2 style={{ textAlign: "left" }}>Pending Forms</h2>
          {displayedSessions.map((tutor, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {tutor.firstName} {tutor.lastName}
                  </div>

                  <div>
                    {tutor?.submittedOn && formatDateTime(tutor?.submittedOn)}
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div
                  style={{
                    marginBottom: "1rem",
                    marginRight: "1rem",
                    marginLeft: "1rem",
                    overflow: "hidden",
                  }}
                >
                  <div>
                    <div>
                      <strong>City:</strong> {tutor.city}
                    </div>
                    <div>
                      <strong>State:</strong> {tutor.state}
                    </div>
                    <div>
                      <strong>Zip:</strong> {tutor.zip}
                    </div>
                    <div>
                      <strong>Email:</strong> {tutor.email || "Not provided"}
                    </div>
                    <div>
                      <strong>Programmes:</strong> {tutor.programmes.join(", ")}
                    </div>
                    <div>
                      <strong>Subjects:</strong> {tutor.subjects.join(", ")}
                    </div>
                    <div>
                      <strong>Assignments:</strong>{" "}
                      {tutor.assignments.join(", ")}
                    </div>
                    <div>
                      <strong>Curricula:</strong> {tutor.curricula.join(", ")}
                    </div>
                    <div>
                      <strong>Resume:</strong>{" "}
                      {tutor.resume ? (
                        <a href={tutor.resume} download>
                          Download Resume
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    style={{ marginRight: "10px" }}
                    onClick={() => {
                      setShowModal(true);
                      setSelectedLink(tutor);
                    }}
                  >
                    Mark as Processed
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => {
                      setCreateAccountModal(true);
                      setSelectedTutor(tutor);
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}

          {tutors?.length > itemsPerPage && (
            <div
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                marginTop: "20px",
              }}
            >
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(tutors?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                />
              </Stack>
            </div>
          )}

          {tutors?.length === 0 && (
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#ccc",
                fontSize: "1.5rem",
              }}
            >
              No Pending Forms
            </div>
          )}

          <Modal
            open={createAccountModal}
            onClose={() => {
              setCreateAccountModal(false);
            }}
          >
            <CustomModal>
              <SignupForm
                setCreateAccountModal={setCreateAccountModal}
                tutor={selectedTutor}
              />
            </CustomModal>
          </Modal>

          <Dialog
            open={showModal}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => {
              setShowModal(false);
            }}
            aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle>
              {"Please confirm to mark this as processed"}
            </DialogTitle>

            <DialogActions>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                No
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                onClick={() => handleProcessedClick(selectedLink)}
              >
                {loading ? "Confirming" : "Confirm"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <ProcessedTutorForm />
      </div>
    </div>
  );
};

export default TutorForm;
