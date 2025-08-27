import React, { useState, useEffect, useContext } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import { Modal } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../../Context/MyContext";
import toast from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function AddSubjectsApplication({ userDetails, userId }) {
  const { subjectsArray } = useContext(MyContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [subjectsToTeach, setSubjectsToTeach] = useState(
    userDetails?.subjects ? userDetails?.subjects : {}
  );

  const [deleteSessionModal, setDeleteSessionModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [currentTier, setCurrentTier] = useState(userDetails?.tutorTier || "");
  const [hourlyRate, setHourlyRate] = useState(userDetails?.hourlyRate || "");

  const [tierSubmitting, setTierSubmitting] = useState(false);
  const [enrolledSubmitting, setEnrolledSubmitting] = useState(false);

  async function savingTierInformationChanges() {
    setTierSubmitting(true);
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const userData = querySnapshot.docs[0].data();

        var details = {};
        if (hourlyRate !== 0 && currentTier !== "") {
          details = { hourlyRate: hourlyRate, tutorTier: currentTier };
        } else if (hourlyRate !== 0) {
          details = { hourlyRate: hourlyRate };
        } else if (currentTier !== "") {
          details = { tutorTier: currentTier };
        }

        // Update only the specified fields in the document
        await updateDoc(docRef, details);
        toast.success("Info Updated!");
      }
    } catch (e) {
      toast.error("Error updating information");
    } finally {
      setTierSubmitting(false);
      setHourlyRate(0);
      setCurrentTier("");
    }
  }

  async function savingChanges() {
    setSubmitting(true);
    try {
      const formattedSubjects = {};
      selectedSubjects.forEach((subject) => {
        formattedSubjects[subject] = true;
      });

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const userData = querySnapshot.docs[0].data();

        // Merge the existing subjects with the new ones
        const mergedSubjects = {
          ...userData.subjects,
          ...formattedSubjects,
        };

        const details = { subjects: mergedSubjects };

        // Update only the specified fields in the document
        await updateDoc(docRef, details);
        setShowModal(false);
        toast.success("Subjects added");
      }
    } catch (e) {
      toast.error("Error adding subjects");
    } finally {
      setSubmitting(false);
    }
  }

  const handleChange = (subject) => {
    setSubjectsToTeach((prevState) => ({
      ...prevState,
      [subject]: !prevState[subject],
    }));
  };

  const handleDelete = (subject) => {
    const { [subject]: omit, ...rest } = subjectsToTeach;
    setSubjectsToTeach(rest);
  };

  const renderElement = () => {
    return (
      <React.Fragment>
        <div>
          <select
            style={{ width: "100%", padding: "10px", flex: 1, outline: "none" }}
            onChange={(e) =>
              setSelectedSubjects([...selectedSubjects, e.target.value])
            }
            aria-label=".form-select-sm example"
          >
            <option value="">Select</option>
            {subjectsArray.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          {selectedSubjects.map((item, index) => (
            <button
              onMouseOver={(event) => {
                event.target.style.backgroundColor = "rgb(156, 16, 16)";
              }}
              onMouseOut={(event) => {
                event.target.style.backgroundColor = "#292929";
              }}
              style={{
                margin: "10px",
                backgroundColor: "#292929",
                borderRadius: "2rem",
              }}
              onClick={() => {
                setSelectedSubjects(selectedSubjects.filter((e) => e !== item));
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </React.Fragment>
    );
  };

  async function saveEnrolledSubjects() {
    setEnrolledSubmitting(true);
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        const details = { subjects: subjectsToTeach };

        // Update enrolled subjects in Firestore
        await updateDoc(docRef, details);
        toast.success("Changes saved");
      }
    } catch (e) {
      toast.error("Error saving enrolled subjects");
    } finally {
      setEnrolledSubmitting(false);
    }
  }

  async function deleteItemHandler(notificationId) {
    setSubmitting(true);
    try {
      // Query Firestore to get user details based on userId
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const userDocSnapshot = await getDocs(q);

      if (!userDocSnapshot.empty) {
        // User document found
        const userDoc = userDocSnapshot.docs[0];
        const userData = userDoc.data();
        // Filter out the item with the specified notificationId
        const updatedNotifications = userData.teacherSubjectApplication.filter(
          (notification) => notification.id !== notificationId
        );
        // Update teacherSubjectApplication array in Firestore
        await updateDoc(doc(db, "userList", userDoc.id), {
          teacherSubjectApplication: updatedNotifications,
        });

        toast.success("Application Deleted");
        setDeleteSessionModal(false);
      } else {
        toast.error("User document not found");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* <Accordion
      >
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
            Tier & Hourly Rate
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ width: "100%", marginTop: "20px" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ marginRight: "10px", flex: 1 }}>
                <b>Current Tier:</b> {userDetails?.tutorTier}
              </div>
              <div style={{ flex: 1 }}>
                <select
                  style={{
                    height: "50px",
                    paddingLeft: "15px",
                    width: "100%",
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "0px",
                    outline: "none",
                    borderRadius: "5px",
                    border: "1px solid #eee",
                  }}
                  onChange={(e) => setCurrentTier(e.target.value)}
                  aria-label=".form-select-sm example"
                  value={currentTier}
                >
                  <option value="">Select</option>
                  <option value="Standard">Standard Level ($24)</option>
                  <option value="Top">Top Level ($28)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={{ marginRight: "10px", flex: 1 }}>
                <b>Current Hourly Rate:</b> $ {userDetails?.hourlyRate}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  style={{
                    flex: 1,
                    height: "50px",
                    paddingLeft: "15px",
                    width: "100%",
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "0px",
                    outline: "none",
                    borderRadius: "5px",
                    border: "1px solid #eee",
                  }}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  value={hourlyRate}
                  type={"number"}
                />
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {tierSubmitting ? (
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="outlined"
                >
                  SAVING
                </LoadingButton>
              ) : (
                <Button
                  onClick={savingTierInformationChanges}
                  variant="contained"
                  color="success"
                >
                  SAVE
                </Button>
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion> */}

      <Accordion
      >
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
            Approved Subjects
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ width: "100%", marginTop: "20px" }}>
            {Object.keys(userDetails?.subjects ? userDetails?.subjects : {})
              .sort((a, b) => a.localeCompare(b))
              .map((subject) => (
                <div
                  key={subject}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={subjectsToTeach[subject]}
                      onChange={() => handleChange(subject)}
                    />
                    {subject}
                  </label>
                  <IconButton
                    aria-label="delete"
                    size="large"
                    onClick={() => handleDelete(subject)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </div>
              ))}

            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {enrolledSubmitting ? (
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="outlined"
                >
                  SAVING
                </LoadingButton>
              ) : (
                <Button
                  onClick={saveEnrolledSubjects}
                  variant="contained"
                  color="success"
                >
                  SAVE
                </Button>
              )}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {
  userDetails?.teacherSubjectApplication?.length > 0 &&
      <Accordion
      >
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
            New Subject Applications
          </div>
        </AccordionSummary>
        <AccordionDetails>
          {userDetails?.teacherSubjectApplication?.map((item) => (
            <Accordion
              style={{
                borderRadius: "5px",
                background: "rgba(255,255,255,0.2)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div
                  style={{
                    flex: 1,
                    justifyContent: "space-between",
                    display: "flex",
                    fontSize: "large",
                    fontWeight: "bold",
                  }}
                >
                  <div>{item.subjectsToBeClearedFor}</div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  <div>
                    <b>Subject To Be Cleared For:</b>{" "}
                    {item.subjectsToBeClearedFor}
                  </div>

                  <div>
                    <b>Tutor Name:</b> {item.tutorName}
                  </div>

                  <div>
                    <b>Previous Experience:</b>{" "}
                    {item.describePreviousExperience}
                  </div>

                  <div>
                    <b>Proof of Grade:</b>{" "}
                    <a href={item.proofOfGrade} download>
                      Download
                    </a>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Button
                      onClick={() => {
                        setSelectedLink(item);
                        setDeleteSessionModal(true);
                      }}
                      variant="outlined"
                      color="error"
                    >
                      DELETE
                    </Button>
                    <Button
                      onClick={() => {
                        setShowModal(true);
                        setSelectedLink(item);
                      }}
                      variant="contained"
                      color="success"
                    >
                      ADD SUBJECT
                    </Button>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionDetails>
      </Accordion>
    }

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
          {"Are you sure you want to delete this application?"}
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
              onClick={() => deleteItemHandler(selectedLink.id)}
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
              DELETING
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

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
              <h2 style={{ textAlign: "left" }}>Add Subjects</h2>
              <div style={{ marginTop: "20px", padding: "10px" }}>
                <div
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
                  {renderElement()}
                </div>
              </div>

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
                  onClick={() => setShowModal(false)}
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
                    ADDING
                  </LoadingButton>
                ) : (
                  <Button
                    onClick={() => {
                      savingChanges();
                    }}
                    variant="contained"
                    color="success"
                  >
                    ADD
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
