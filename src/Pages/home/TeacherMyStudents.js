import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
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
import styles from "./TeacherMyStudents.module.css";
import { MyContext } from "../../Context/MyContext";

import Button from "@mui/material/Button";
import { Modal } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";

import toast from "react-hot-toast";
import { TeacherFillingForm } from "./TeacherFillingForm";
import CustomModal from "../../Components/CustomModal/CustomModal";

const getUKDateTime = (dateString, timeString) => {
  const date = new Date(dateString);
  const time = new Date(`2000-01-01T${timeString}`);
  
  const options = {
    timeZone: 'Europe/London',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const ukDate = date.toLocaleDateString('en-GB');
  const ukTime = time.toLocaleTimeString('en-GB', options);

  return `${ukDate} ${ukTime}`;
};

export default function TeacherMyStudents() {
  const [students, setStudents] = useState([]);
  const [deactivatedStudentsList, setDeactivatedStudentsList] = useState([]);

  const [bookSessionModal, setBookSessionModal] = useState(false);
  const [completeSessionModal, setCompleteSessionModal] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);

  const [sessionPrice, setSessionPrice] = useState(0);

  const [selectedLink, setSelectedLink] = useState("");

  const [linkId, setLinkId] = useState("");
  const { userDetails, addNotification, convertToGBP, timeZoneConverter, generateRandomId, calculateHoursLeft } = useContext(MyContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);



  const fetchData = () => {
    setLoading(true);
    setFetchingData(true);

    const linkedRef = collection(db, "Linked");
    const q = query(linkedRef, where("teacherId", "==", userDetails?.userId));

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

  useEffect(() => {
    fetchData();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  // Function to handle booking a session for a subject
  const bookSession = async (linkId) => {
    if (!sessionData.date || !sessionData.time || !sessionData.note) {
      toast("Please fill all details");
      return;
    }
  
    setSubmitting(true);
  
    try {
      const studentRef = doc(db, "Linked", linkId.id);
      const studentSnapshot = await getDoc(studentRef);
  
      if (!studentSnapshot.exists()) {
        toast.error("Student not found");
        return;
      }
  
      const studentData = studentSnapshot.data();
  
      const finalSessionInfo = {
        ...sessionData,
        price: selectedLink.price,
        tutorHourlyRate: linkId?.tutorHourlyRate,
        timezone: userDetails?.timeZone,
        id: generateRandomId(),
        subject: selectedLink?.subject,
        studentName: selectedLink?.studentName,
        studentEmail: selectedLink?.studentEmail,
        studentId: selectedLink?.studentId,
        teacherId: selectedLink?.teacherId,        
        teacherName: selectedLink?.teacherName,
        teacherEmail: selectedLink?.teacherEmail,
      };
  
      await updateDoc(studentRef, {
        bookedSessions: arrayUnion(finalSessionInfo)
      });
  
      const accountRef = doc(db, "userList", linkId.studentId);
      const docSnapshot = await getDoc(accountRef);
  
      if (!docSnapshot.exists()) {
        toast.error("Failed to Book Session");
        return;
      }
  
      const currentCredits = parseFloat(docSnapshot.data().credits);
      const priceInGBP = parseFloat(convertToGBP(parseFloat(linkId.price)));
  
      if (isNaN(priceInGBP)) {
        toast.error("Failed to calculate credits");
        return;
      }
  
      const updatedCredits = currentCredits - priceInGBP;
  
      await updateDoc(accountRef, { credits: updatedCredits });
  
      const studentNotification = `${selectedLink.teacherName} booked a session with you for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`;
      const teacherNotification = `You booked a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`;
  
      await addNotification(teacherNotification, userDetails.userId);
      await addNotification(studentNotification, selectedLink.studentId);
  
      toast.success("Session Booked");
      setBookSessionModal(false);
      setSessionData({
        date: "",
        time: "",
        duration: 1,
        note: "",
        price: 0,
        tutorHourlyRate: 0
      });
    } catch (error) {
      toast.error("Failed to Book Session");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Example usage:
  const handleBookSession = async (linkId) => {
    await bookSession(linkId);
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
      price: selectedLink?.price,
      tutorHourlyRate: selectedLink?.tutorHourlyRate
    };

    const invoice = {
      studentId: selectedLink.studentId,
      teacherId: selectedLink.teacherId,
      subject: selectedLink.subject,
      amount: selectedLink?.price,
      tutorHourlyRate: selectedLink?.tutorHourlyRate,
      createdAt: new Date(),
      studentName: selectedLink.studentName,
      teacherName: selectedLink.teacherName,
      sessionInfo: finalSessionInfo,
      status: "Pending",
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
    tutorHourlyRate: 0
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

  const addOneHour = (startTime) => {
    if (!startTime) {
      return ""; // or handle the case when startTime is not provided
    }

    const [hours, minutes] = startTime.split(":");
    const newTime = `${(parseFloat(hours, 10) + 1)
      .toString()
      .padStart(2, "0")}:${minutes}`;
    return newTime;
  };

  const [updatedStudents, setUpdatedStudents] = useState([]);

  const [firstStudent, setFirstStudent] = useState({});
  const [secondStudent, setSecondStudent] = useState({});

  const [firstStudentCredits, setFirstStudentCredits] = useState(0);
  const [secondStudentCredits, setSecondStudentCredits] = useState(0);

  const [firstTimeZone, setFirstTimeZone] = useState("");
  const [secondTimeZone, setSecondTimeZone] = useState("");

  const [fetchingFirstStudentCredits, setFetchingFirstStudentCredits] =
    useState(false);
  const [fetchingSecondStudentCredits, setFetchingSecondStudentCredits] =
    useState(false);

  useEffect(() => {
    if (students.length !== 0) {
      // const unsubscribe = fetchCreditsForSelectedStudent(
      //   selectedStudent,
      //   setCreditsForSelectedStudent,
      //   setFetchingCredits
      // );
      if (students.length === 1) {
        const firstStudent = students[0];


        setFirstStudent(firstStudent);

        if (firstStudent?.studentId) {
          // const unsubscribe = fetchCreditsForSelectedStudent(
          //   selectedStudent,
          //   setCreditsForSelectedStudent,
          //   setFetchingCredits
          // );

          setFetchingFirstStudentCredits(true);
          let unsubscribe; // Declare the unsubscribe variable outside the try block

          try {
            const accountRef = doc(db, "userList", firstStudent?.studentId);
            unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                const currentCredits = docSnapshot.data().credits;
                setFirstStudentCredits(currentCredits);
                setFirstTimeZone(docSnapshot.data()?.timeZone)
                setFetchingFirstStudentCredits(false);
              } else {
                console.error(
                  `Document not found for studentId: ${firstStudent?.studentId}`
                );
                setFetchingFirstStudentCredits(false);
              }
            });
          } catch (error) {
            console.error(
              `Error fetching credits for studentId: ${firstStudent?.studentId}`,
              error
            );
            setFetchingFirstStudentCredits(false);
            setFirstStudentCredits(0);
          }

          // Cleanup function to unsubscribe when the component unmounts or when selectedStudent changes
          return () => unsubscribe && unsubscribe();
        }
      }

      if (students.length === 2) {
        const firstStudent = students[0];
        const secondStudent = students[1];
        setFirstStudent(firstStudent);
        setSecondStudent(secondStudent);

        const handleStudentCredits = async (
          student,
          setStudentCredits,
          setFetchingStudentCredits,
          setFetchingTimeZone
        ) => {
          if (student?.studentId) {
            setFetchingStudentCredits(true);
            let unsubscribe;

            try {
              const accountRef = doc(db, "userList", student.studentId);
              unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const currentCredits = docSnapshot.data().credits;
                  setStudentCredits(currentCredits);
                  setFetchingStudentCredits(false);
                  setFetchingTimeZone(docSnapshot.data()?.timeZone)
                } else {
                  console.error(
                    `Document not found for studentId: ${student.studentId}`
                  );
                  setFetchingStudentCredits(false);
                }
              });
            } catch (error) {
              console.error(
                `Error fetching credits for studentId: ${student.studentId}`,
                error
              );
              setFetchingStudentCredits(false);
              setStudentCredits(0);
            }

            // Cleanup function to unsubscribe when the component unmounts or when selectedStudent changes
            return () => unsubscribe && unsubscribe();
          }
        };

        // Fetch credits for the first student
        handleStudentCredits(
          firstStudent,
          setFirstStudentCredits,
          setFetchingFirstStudentCredits,
          setFirstTimeZone
        );

        // Fetch credits for the second student
        handleStudentCredits(
          secondStudent,
          setSecondStudentCredits,
          setFetchingSecondStudentCredits,
          setSecondTimeZone
        );
      }
    }
  }, [students]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setFetchingData(true);
  //     if (students.length !== 0) {
  //       try {
  //         const allStudents = await Promise.all(
  //           students.map(async (student) => {
  //             try {
  //               const accountRef = doc(db, "userList", student?.studentId);
  //               const docSnapshot = await getDoc(accountRef);

  //               if (docSnapshot.exists()) {
  //                 const currentCredits = docSnapshot.data().credits;

  //                 // Update the credits field in the student data
  //                 return {
  //                   ...student,
  //                   credits: currentCredits,
  //                 };
  //               } else {
  //                 console.error(`Document not found for studentId: ${student?.studentId}`);
  //                 return student; // Return the original data if the document is not found
  //               }
  //             } catch (error) {
  //               console.error(`Error fetching credits for studentId: ${student?.studentId}`, error);
  //               return student; // Return the original data if an error occurs
  //             }
  //           })
  //         );
  //         setUpdatedStudents(allStudents);

  //     setFetchingData(false);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //         setFetchingData(false);
  //       }
  //     } else {
  //     }
  //   };

  //   fetchData();
  // }, [students]);


  return (
    <div style={{flex: 1}}>
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
      <h2 style={{ textAlign: "left" }}>My Students</h2>
      {/* {updatedStudents.map((student, index) => (
          <div key={index} className={styles.teachersContainer}>
            <div className={styles.subjects}>
              <div>
                <span style={{ fontWeight: "bold" }}>
                  {student?.studentName}
                </span>{" "}
                <br />
                <span>{student?.studentInfo?.email}</span>{" "}
              </div>

              <button
                onClick={() => {
                  setBookSessionModal(true);
                  setSelectedLink(student);
                }}
                disabled={
                  student.isSessionBooked ||
                  student.credits === 0 ||
                  student?.studentDeactivated
                }
                style={{
                  margin: "5px",
                  backgroundColor:
                    student.isSessionBooked ||
                    student.credits === 0 ||
                    student?.studentDeactivated
                      ? "#ccc"
                      : "#007BFF",
                  cursor:
                    student.isSessionBooked ||
                    student.credits === 0 ||
                    student?.studentDeactivated
                      ? "not-allowed"
                      : "pointer",
                  padding: "5px 10px",
                  borderRadius: "2px",
                  flex: 1,
                  maxWidth: "150px",
                }}
              >
                {student?.isSessionBooked ? "BOOKED" : "BOOK LESSON"}
              </button>
            </div>

            {student.credits === 0 && (
              <p style={{ color: "red" }}>No Credits</p>
            )}
          </div>
        ))} */}

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
                    {firstStudent?.studentName}
                  </span>{" "}
                  <br />
                  <span>{firstStudent?.studentInfo?.email}</span> <br />
                  {/* <span>Hourly Rate: £ {firstStudent?.price}</span>{" "} */}
                </div>

                <Button
                  variant="contained"
                  onClick={() => {
                    setBookSessionModal(true);
                    setSelectedLink({...firstStudent, timeZone: firstTimeZone});
                  }}
                  disabled={
                    parseFloat(firstStudentCredits) < convertToGBP( parseFloat(firstStudent?.price) ) ||
                    firstStudent?.studentDeactivated ||
                    fetchingFirstStudentCredits
                  }
                  style={{
                    flex: 1,
                    width: "100%",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  BOOK LESSON
                </Button>
              </div>
              {fetchingFirstStudentCredits ? (
                <p>Fetching Credits...</p>
              ) : (
                <>
                  {parseFloat(firstStudentCredits) < convertToGBP( parseFloat(firstStudent?.price) )  ? (
                    <p style={{ color: "red" }}>
                     Insufficient Credits
                    </p>
                  ) : (
                    <p style={{ color: "darkgreen" }}>
                    {
                      calculateHoursLeft(convertToGBP(parseFloat(firstStudent?.price)), parseFloat(firstStudentCredits))
                    }{" "}
                      Credits Available
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {students.length === 2 && (
            <>
              {/* // FIRST STUDENT DATA */}
              <div className={styles.teachersContainer}>
                <div className={styles.subjects}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                      {firstStudent?.studentName}
                    </span>{" "}
                    <br />
                    <span>{firstStudent?.studentInfo?.email}</span> <br />
                    {/* <span>Hourly Rate: £ {firstStudent?.price}</span>{" "} */}
                  </div>

                  <Button
                    variant="contained"
                    onClick={() => {
                      setBookSessionModal(true);
                      setSelectedLink({...firstStudent, timeZone: firstTimeZone});
                    }}
                    disabled={
                      parseFloat(firstStudentCredits) < convertToGBP( parseFloat(firstStudent?.price) ) ||
                      firstStudent?.studentDeactivated ||
                      fetchingFirstStudentCredits
                    }
                    style={{
                      flex: 1,
                      width: "100%",
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    BOOK LESSON
                  </Button>
                </div>
                {fetchingFirstStudentCredits ? (
                  <p>Fetching Credits...</p>
                ) : (
                  <>
                    {parseFloat(firstStudentCredits) < convertToGBP( parseFloat(firstStudent?.price) )  ? (
                      <p style={{ color: "red" }}>
                        Insufficient Credits
                      </p>
                    ) : (
                      <p style={{ color: "darkgreen" }}>
                        
                      {
                        calculateHoursLeft(convertToGBP( parseFloat(firstStudent?.price) ), parseFloat(firstStudentCredits))
                      }{" "}
                        Credits Available
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* // SECOND STUDENT DATA */}
              <div
                style={{ borderBottom: "none" }}
                className={styles.teachersContainer}
              >
                <div className={styles.subjects}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                      {secondStudent?.studentName}
                    </span>{" "}
                    <br />
                    <span>{secondStudent?.studentInfo?.email}</span> <br />
                    {/* <span>Hourly Rate: £ {secondStudent?.price}</span>{" "} */}
                  </div>

                  <Button
                    variant="contained"
                    onClick={() => {
                      setBookSessionModal(true);
                      setSelectedLink({...secondStudent, timeZone: secondTimeZone});
                    }}
                    disabled={
                      parseFloat(secondStudentCredits) < convertToGBP( parseFloat(secondStudent?.price) ) ||
                      secondStudent?.studentDeactivated ||
                      fetchingSecondStudentCredits
                    }
                    style={{
                      flex: 1,
                      width: "100%",
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    BOOK LESSON
                  </Button>
                </div>
                {fetchingSecondStudentCredits ? (
                  <p>Fetching Credits...</p>
                ) : (
                  <>
                    {parseFloat(secondStudentCredits) < convertToGBP( parseFloat(secondStudent?.price) )  ? (
                      <p style={{ color: "red" }}>
                        Insufficient Credits
                      </p>
                    ) : (
                      <p style={{ color: "darkgreen" }}>
                      {
                        calculateHoursLeft(convertToGBP( parseFloat(secondStudent?.price) ), parseFloat(secondStudentCredits))
                      }{" "}
                        Credits Available
                      </p>
                    )}
                  </>
                )}
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
              No Students
            </div>
          ) : (
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                navigate("/myStudents");
              }}
              variant="outlined"
            >
              VIEW MY STUDENTS
            </Button>
          )}
        </>
      )}

<Modal
      open={bookSessionModal}
      onClose={() => {
        setBookSessionModal(false);
      }}
    >
      <CustomModal>
            <h2 style={{ textAlign: "left" }}>Book Session</h2>
            <p style={{ color: "#1e1e1e", textAlign: "center", fontSize: "1.8rem" }}>
              {selectedLink?.subject}
            </p>
            <p style={{ color: "#1e1e1e", textAlign: "center", fontSize: "1.2rem" }}>
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
                  <p style={{ marginRight: "10px", fontSize: "medium" }}>Date:</p>
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
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <div style={{ flex: 1, width: "100%", marginBottom: "20px" }}>
                  <p style={{ marginRight: "10px", fontSize: "medium" }}>Time:</p>
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
                      borderRadius: '5px'
                    }}
                  />
                </div>
                {/* Display UK timing */}
                <p>As per student timezone({selectedLink?.timeZone}): {sessionData.date && sessionData.time && selectedLink?.timeZone ? `${
                      timeZoneConverter(
                        sessionData.date,
                        sessionData.time,
                        selectedLink?.timeZone
                      )?.date
                    } | ${
                      timeZoneConverter(
                        sessionData.date,
                        sessionData.time,
                        selectedLink?.timeZone
                      )?.time
                    }` : ''}</p>
                <div style={{ flex: 1, width: "100%", marginBottom: "5px" }}>
                  <p style={{ marginRight: "10px", fontSize: "medium" }}>Note:</p>
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
                      borderRadius: '5px'
                    }}
                  />
                </div>
              </form>
              <div style={{ display: "flex", flexWrap: "wrap", flex: 1, justifyContent: "flex-end", alignItems: "center", gap: "10px", width: "100%", marginTop: "20px" }}>
                <Button variant="outlined" color="error" onClick={() => setBookSessionModal(false)}>CANCEL</Button>
                {submitting ? (
                  <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined">
                    SUBMITTING
                  </LoadingButton>
                ) : (
                  <Button onClick={() => handleSubmit()} variant="contained" color="success">SUBMIT</Button>
                )}
              </div>
            </div>
            </CustomModal>
    </Modal>
    </div>

    <TeacherFillingForm />
    </div>
  );
}
