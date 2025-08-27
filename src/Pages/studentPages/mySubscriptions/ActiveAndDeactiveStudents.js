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
import styles from "./ActiveAndDeactiveStudents.module.css";
import { MyContext } from "../../../Context/MyContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Button from "@mui/material/Button";
import { Modal } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

import toast from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ActiveAndDeactiveStudents() {
  const [students, setStudents] = useState([]);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [deactivatedStudentsList, setDeactivatedStudentsList] = useState([]);

  const [bookSessionModal, setBookSessionModal] = useState(false);
  const [completeSessionModal, setCompleteSessionModal] = useState(false);

  const [editSessionModal, setEditSessionModal] = useState(false);
  const [deleteSessionModal, setDeleteSessionModal] = useState(false);
  const [deactivateStudentModal, setDeactivateStudentModal] = useState(false);

  const [reactivateStudentModal, setReactivateStudentModal] = useState(false);
  const [reactivatingReason, setReactivatingReason] = useState("");

  const [sessionPrice, setSessionPrice] = useState(0);

  const [selectedLink, setSelectedLink] = useState("");

  const [active, setActive] = useState("Active Students");
  const [selectedStudent, setSelectedStudent] = useState({});

  const [linkId, setLinkId] = useState("");
  const {
    isUserLoggedIn,
    userType,
    addNotification,
    userDetails,
    calculateHoursLeft,
    convertToGBP,
  } = useContext(MyContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userDetails?.userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(
          linkedRef,
          where("studentId", "==", userDetails?.userId)
        );

        try {
          // Fetch data
          setLoading(true);
          const querySnapshot = await getDocs(q);
          const updatedStudents = [];
          const deactivatedStudents = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.studentDeactivated) {
              deactivatedStudents.push({ ...data });
            } else {
              updatedStudents.push({ ...data });
            }
          });

          setDeactivatedStudentsList(deactivatedStudents);
          setStudents(updatedStudents);
          setCurrentStudents(updatedStudents);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          // Set loading to false once data fetching is complete
          setLoading(false);
        }
      }
    };

    // Invoke fetchData immediately and whenever userDetails?.userId changes
    fetchData();
  }, [userDetails?.userId]);

  const [creditsForSelectedStudent, setCreditsForSelectedStudent] =
    useState("");
  const [fetchingCredits, setFetchingCredits] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedStudent?.studentId) {
      setFetchingCredits(true);
      let unsubscribe; // Declare the unsubscribe variable outside the try block

      try {
        const accountRef = doc(db, "userList", selectedStudent?.teacherId);
        unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const currentCredits = docSnapshot.data().email;
            setCreditsForSelectedStudent(currentCredits);
            setFetchingCredits(false);
          } else {
            console.error(
              `Document not found for studentId: ${selectedStudent?.studentId}`
            );
            setFetchingCredits(false);
            setCreditsForSelectedStudent("");
          }
        });
      } catch (error) {
        console.error(
          `Error fetching credits for studentId: ${selectedStudent?.studentId}`,
          error
        );
        setFetchingCredits(false);
        setCreditsForSelectedStudent("");
      }

      // Cleanup function to unsubscribe when the component unmounts or when selectedStudent changes
      return () => unsubscribe && unsubscribe();
    } else {
      setCreditsForSelectedStudent("");
    }
  }, [selectedStudent]);

  // Function to handle booking a session for a subject
  const bookSession = async (linkId) => {
    if (
      Object.values(sessionData).length === 0 ||
      !sessionData.date ||
      !sessionData.time ||
      !sessionData.note
    ) {
      toast("Please fill all details");
    } else {
      setSubmitting(true);
      try {
        const studentRef = doc(db, "Linked", linkId.id);
        const studentSnapshot = await getDoc(studentRef);

        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();

          // Check if sessionInfo already exists in the student data
          const existingSessionInfo = studentData.sessionInfo || [];

          const finalSessionInfo = {
            ...sessionData,
            price: selectedLink.price,
          };

          // Update the document by appending the new sessionData to the existing sessionInfo array
          await updateDoc(studentRef, {
            sessionInfo: finalSessionInfo,
            isSessionBooked: true,
          });

          const accountRef = doc(db, "userList", linkId?.studentId);

          // Fetch the current document
          const docSnapshot = await getDoc(accountRef);

          if (docSnapshot.exists()) {
            // If the document exists, retrieve the current credits value
            const currentCredits = docSnapshot.data().credits;

            // Subtract a certain value from the current credits
            const updatedCredits = currentCredits - parseInt(linkId.price);

            // Update the document with the new credits value
            await updateDoc(accountRef, { credits: updatedCredits });
            await addNotification(
              `You booked a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`,
              userDetails?.userId
            );
            await addNotification(
              `${selectedLink.teacherName} booked a session with you for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`,
              selectedLink.studentId
            );
            toast.success("Session Booked");
            setBookSessionModal(false);
            setSessionData({
              date: "",
              time: "",
              duration: 1,
              note: "",
              price: 0,
            });
          } else {
            toast.error("Failed to Book Session");
          }
        } else {
          toast.error("Student not found");
        }
      } catch (error) {
        toast.error("Failed to Book Session");
      } finally {
        setSubmitting(false); // Reset submitting to false regardless of success or failure
      }
    }
  };

  // Function to handle completing a session for a subject
  const completeSession = async (linkId) => {
    try {
      const studentRef = doc(db, "Linked", linkId.id);
      const studentSnapshot = await getDoc(studentRef);

      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.data();

        // Update the document by appending the new sessionData to the existing sessionInfo array
        await updateDoc(studentRef, {
          sessionInfo: {},
          isSessionBooked: false,
        });
        setCompleteSessionModal(false);
      } else {
        console.error("Student document not found");
      }
    } catch (error) {
      console.error("Error booking session: ", error);
    }

    const finalSessionInfo = {
      ...sessionData,
      price: selectedLink?.teacherHourlyRate,
    };

    const invoice = {
      studentId: selectedLink.studentId,
      teacherId: selectedLink.teacherId,
      subject: selectedLink.subject,
      amount: selectedLink?.teacherHourlyRate,
      createdAt: new Date(),
      studentName: selectedLink.studentName,
      teacherName: selectedLink.teacherName,
      sessionInfo: finalSessionInfo,
      status: "Pending",
      sessionPrice: selectedLink.price,
    };

    const docRef = doc(collection(db, "Linked"), selectedLink.id);

    await updateDoc(docRef, {
      invoices: arrayUnion(invoice),
    });

    alert(`Invoice generated for document with ID: ${selectedLink.id}`);
  };

  const [sessionData, setSessionData] = useState({
    date: "",
    time: "",
    duration: 1,
    note: "",
    price: 0,
  });

  useEffect(() => {
    if (selectedLink?.sessionInfo) {
      setSessionData(selectedLink?.sessionInfo);
    }
  }, [selectedLink]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionData({
      ...sessionData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    // You can perform actions with the session data here, like posting to Firebase or processing it
    bookSession(selectedLink);
    // Reset the form after submission
  };

  // Function to handle booking a session for a subject
  const editSession = async (linkId) => {
    if (
      Object.values(sessionData).length === 0 ||
      !sessionData.date ||
      !sessionData.time ||
      !sessionData.note
    ) {
      alert("Please fill all details");
    } else {
      try {
        const studentRef = doc(db, "Linked", linkId.id);
        const studentSnapshot = await getDoc(studentRef);

        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();

          // Check if sessionInfo already exists in the student data
          const existingSessionInfo = studentData.sessionInfo || [];

          const finalSessionInfo = {
            ...sessionData,
            price: selectedLink?.teacherHourlyRate,
          };

          // Update the document by appending the new sessionData to the existing sessionInfo array
          await updateDoc(studentRef, {
            sessionInfo: finalSessionInfo,
            isSessionBooked: true,
          });
          setEditSessionModal(false);
        } else {
          console.error("data not found");
        }
      } catch (error) {
        console.error("Error updating session: ", error);
      }
    }
  };

  // Function to handle deleting a session for a subject
  const deleteSession = async (linkId) => {
    try {
      setSubmitting(true);
      const studentRef = doc(db, "Linked", linkId.id);
      const studentSnapshot = await getDoc(studentRef);

      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.data();

        const updatedCompletedSessions = [
          ...(studentData.deletedSessions || []),
        ];
        const newSessionData = { ...sessionData, type: "Deleted" };
        updatedCompletedSessions.push(newSessionData);

        // Fetch the current document before updating to prevent race conditions
        const accountRef = doc(db, "userList", linkId?.studentId);
        const docSnapshot = await getDoc(accountRef);

        if (docSnapshot.exists()) {
          const currentCredits = docSnapshot.data().credits;
          const updatedCredits = currentCredits + parseInt(linkId.price);

          // Update the document with the new credits value
          await updateDoc(accountRef, { credits: updatedCredits });

          // After updating credits, proceed to delete the session
          await updateDoc(studentRef, {
            deletedSessions: updatedCompletedSessions,
            sessionInfo: {},
            isSessionBooked: false,
          });

          setSessionData({
            date: "",
            time: "",
            duration: 1,
            note: "",
            price: 0,
          });
          setDeleteSessionModal(false);
          toast.success("Session Cancelled");
        } else {
          toast.error("Failed to cancel session");
        }
      } else {
        toast.error("Failed to cancel session");
      }
    } catch (error) {
      toast.error("Failed to cancel session");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle booking a session for a subject
  const deactivateStudent = async (linkId) => {
    setSubmitting(true);
    try {
      const studentRef = doc(db, "Linked", linkId.id);
      const studentSnapshot = await getDoc(studentRef);

      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.data();

        // Update the document by appending the new sessionData to the existing sessionInfo array
        await updateDoc(studentRef, {
          studentDeactivated: true,
        });
        toast.success("Student Deactivated");
        setDeactivateStudentModal(false);
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      toast.error("Error Deactivating Student");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle booking a session for a subject
  const reactivateStudent = async (linkId) => {
    if (reactivatingReason !== "") {
      setSubmitting(true);
      try {
        const studentRef = doc(db, "Linked", linkId.id);
        const studentSnapshot = await getDoc(studentRef);

        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();

          // Update the document by appending the new sessionData to the existing sessionInfo array
          await updateDoc(studentRef, {
            reactivateRequest: true,
            reactivatingReason: reactivatingReason,
          });
          toast.success("Reactivating Request Submitted");
          await addNotification(
            `You requested to Re-Activate ${selectedLink.studentName} for ${selectedLink.subject}.`,
            userDetails?.userId
          );

          setReactivateStudentModal(false);
        } else {
          toast.error("Student document not found");
        }
      } catch (error) {
        toast.error("Error booking session: ", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast("Please enter details");
    }
  };

  const handleActiveChange = (a) => {
    setActive(a.target.value);
  };

  useEffect(() => {
    if (active === "Active Students") {
      setCurrentStudents(students);
    } else {
      setCurrentStudents(deactivatedStudentsList);
    }
  }, [active]);

  // State to track whether the effect has been triggered
  const [effectTriggered, setEffectTriggered] = useState(false);

  // SELECTION OF STUDENT
  useEffect(() => {
    // Check if the effect has already been triggered
    if (!effectTriggered && currentStudents && currentStudents.length > 0) {
      // Update the selected student
      setSelectedStudent(currentStudents[0]);
      // Set the flag to indicate that the effect has been triggered
      setEffectTriggered(active);
    }
  }, [currentStudents, effectTriggered]);

  const addOneHour = (startTime) => {
    if (!startTime) {
      return ""; // or handle the case when startTime is not provided
    }

    const [hours, minutes] = startTime.split(":");
    const newTime = `${(parseInt(hours, 10) + 1)
      .toString()
      .padStart(2, "0")}:${minutes}`;
    return newTime;
  };

  return (
    <div
      className="shadowAndBorder"
      style={{
        padding: "0.5rem",
        marginTop: "0px",
        flex: 1,
        height: "max-content",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
        background: "rgba(255,255,255, 0.5)",
        backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
        WebkitBackdropFilter: "blur(4px)", // For Safari support,
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "left" }}>Subscriptions</h2>
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
          {(students?.length !== 0 || deactivatedStudentsList.length !== 0) && (
            <Select
              id="demo-select-small"
              value={active}
              onChange={handleActiveChange}
              fullWidth
              variant="outlined"
              style={{
                marginBottom: "10px",
              }}
            >
              <MenuItem value={"Active Students"}>
                Active Subscriptions
              </MenuItem>
              <MenuItem value={"Deactivated Students"}>
                Deactivated Subscriptions
              </MenuItem>
            </Select>
          )}
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "5px",
              flexWrap: "wrap-reverse",
            }}
          >
            {currentStudents.length !== 0 ? (
              <>
                <div style={{ flex: 1 }}>
                  {currentStudents.map((student, index) => (
                    <div
                      style={{
                        fontWeight: "bold",
                        paddingBottom: "10px",
                        flex: 1,
                        padding: "5px",
                        backgroundColor:
                          selectedStudent?.id === student?.id
                            ? "rgba(255,255,255,0.5)"
                            : "transparent",
                        marginBottom: "5px",
                        minHeight: "50px",
                        verticalAlign: "center",
                        textAlign: "center",
                        cursor: "pointer",
                        border:
                          selectedStudent?.id === student?.id
                            ? "1px solid #818181"
                            : "1px solid #ccc",
                      }}
                      onClick={() => {
                        setSelectedStudent(student);
                      }}
                    >
                      <FontAwesomeIcon icon={faGraduationCap} /> <br />
                      {student?.teacherName}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    flex: 4,
                    padding: "10px",
                    maxHeight: "max-content",
                    border: "1px solid #ccc",
                  }}
                >
                  <div style={{ marginBottom: "15px" }}>
                    <span style={{ fontSize: "large", fontWeight: "bold" }}>
                      Tutor Details
                    </span>
                    <br />

                    <span>
                      <b>Name: </b>
                      {selectedStudent?.teacherName}
                    </span>
                    <br />

                    <span>
                      <b>Email: </b>
                      {selectedStudent?.teacherEmail}
                    </span>
                    <br />
                  </div>

                  <div style={{ textAlign: "center", paddingBottom: "10px" }}>
                    <div style={{ fontSize: "large", fontWeight: "bold" }}>
                      Subject
                    </div>

                    {selectedStudent?.subject}
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <div
                      style={{
                        fontSize: "large",
                        fontWeight: "bold",
                        marginBottom: "20px",
                      }}
                    >
                      Subscription Details
                    </div>
                    {/* <span style={{ fontSize: "medium", fontWeight: "bold" }}>
                    Plan: 
                  </span>
                  {selectedStudent?.plan}
                  <br /> */}
                    <span style={{ fontWeight: "bold" }}>ID: </span>
                    {selectedStudent?.id}
                    <br />
                    <>
                      {parseFloat(userDetails?.credits) <
                      convertToGBP(parseFloat(selectedStudent?.price)) ? (
                        <span style={{ color: "red" }}>
                          Insufficient Credits
                        </span>
                      ) : (
                        <span style={{ color: "darkgreen" }}>
                          {calculateHoursLeft(
                            convertToGBP(parseFloat(selectedStudent?.price)),
                            parseFloat(userDetails?.credits)
                          )}{" "}
                          Credits Available
                        </span>
                      )}
                    </>
                    <br />
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: "#aeaeae",
                  fontSize: "1.5rem",
                }}
              >
                No Subscriptions
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        open={bookSessionModal}
        onClose={() => {
          setBookSessionModal(false);
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
              minWidth: "70%",
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
            <div
              style={{
                padding: "20px",
                flex: 1,
                overflow: "auto",
              }}
            >
              <h2 style={{ textAlign: "left" }}>Book Session</h2>
              <p
                style={{
                  color: "#1e1e1e",
                  textAlign: "center",
                  fontSize: "1.8rem",
                }}
              >
                {selectedLink?.subject}
              </p>
              <p
                style={{
                  color: "#1e1e1e",
                  textAlign: "center",
                  fontSize: "1.2rem",
                }}
              >
                {selectedLink?.studentName}
              </p>
              <div style={{ marginTop: "20px", padding: "10px" }}>
                <form
                  style={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: "10px",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div style={{ flex: 1, width: "100%", marginBottom: "20px" }}>
                    <p style={{ marginRight: "10px", fontSize: "medium" }}>
                      Date:
                    </p>
                    <input
                      type="date"
                      name="date"
                      value={sessionData.date}
                      onChange={handleChange}
                      style={{
                        flex: 1,
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.3)",
                        outline: "none",
                        border: "1px solid #aeaeae",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, width: "100%", marginBottom: "20px" }}>
                    <p style={{ marginRight: "10px", fontSize: "medium" }}>
                      Time:{" "}
                      {sessionData.time && (
                        <>
                          ({sessionData.time} - {addOneHour(sessionData.time)})
                        </>
                      )}
                    </p>
                    <input
                      type="time"
                      name="time"
                      value={sessionData.time}
                      onChange={handleChange}
                      style={{
                        flex: 1,
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.3)",
                        outline: "none",
                        border: "1px solid #aeaeae",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, width: "100%", marginBottom: "5px" }}>
                    <p style={{ marginRight: "10px", fontSize: "medium" }}>
                      Note:
                    </p>
                    <textarea
                      name="note"
                      value={sessionData.note}
                      onChange={handleChange}
                      placeholder="Enter note here..."
                      style={{
                        flex: 1,
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.3)",
                        outline: "none",
                        border: "1px solid #aeaeae",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                </form>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setBookSessionModal(false)}
                  >
                    CANCEL
                  </Button>
                  {submitting ? (
                    <LoadingButton
                      loading
                      loadingPosition="start"
                      startIcon={<SaveIcon />}
                      variant="outlined"
                    >
                      SUBMITTING
                    </LoadingButton>
                  ) : (
                    <Button
                      onClick={() => handleSubmit()}
                      variant="contained"
                      color="success"
                    >
                      SUBMIT
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Dialog
        open={deactivateStudentModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setDeactivateStudentModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {"Are you sure you want to deactivate this student?"}
        </DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setDeactivateStudentModal(false);
            }}
          >
            NO
          </Button>
          {!submitting ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => deactivateStudent(selectedLink)}
            >
              YES
            </Button>
          ) : (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              DEACTIVATING
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSessionModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setDeleteSessionModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {"Are you sure you want to cancel this sesson?"}
        </DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setDeleteSessionModal(false);
            }}
          >
            NO
          </Button>
          {!submitting ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => deleteSession(selectedLink)}
            >
              YES
            </Button>
          ) : (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              CANCELLING
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

      <Modal
        open={reactivateStudentModal}
        onClose={() => {
          setBookSessionModal(false);
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
              minWidth: "70%",
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
            <div
              style={{
                padding: "20px",
                flex: 1,
                overflow: "auto",
              }}
            >
              <h2 style={{ textAlign: "left" }}>Re-Activate Student</h2>
              <p
                style={{
                  color: "#1e1e1e",
                  textAlign: "center",
                  fontSize: "1.8rem",
                }}
              >
                {selectedLink?.subject}
              </p>
              <p
                style={{
                  color: "#1e1e1e",
                  textAlign: "center",
                  fontSize: "1.2rem",
                }}
              >
                {selectedLink?.studentName}
              </p>
              <div style={{ marginTop: "20px", padding: "10px" }}>
                <form
                  style={{
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.5)",
                    borderRadius: "10px",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div style={{ flex: 1, width: "100%", marginBottom: "5px" }}>
                    <p style={{ marginRight: "10px", fontSize: "medium" }}>
                      Enter Reason:
                    </p>
                    <textarea
                      name="Enter Reason"
                      value={reactivatingReason}
                      onChange={(e) => {
                        setReactivatingReason(e.target.value);
                      }}
                      placeholder="Please enter details here..."
                      style={{
                        flex: 1,
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.3)",
                        outline: "none",
                        border: "1px solid #aeaeae",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                </form>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setReactivateStudentModal(false)}
                  >
                    CANCEL
                  </Button>
                  {submitting ? (
                    <LoadingButton
                      loading
                      loadingPosition="start"
                      startIcon={<SaveIcon />}
                      variant="outlined"
                    >
                      SUBMITTING
                    </LoadingButton>
                  ) : (
                    <Button
                      onClick={() => reactivateStudent(selectedLink)}
                      variant="contained"
                      color="success"
                    >
                      SUBMIT
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
