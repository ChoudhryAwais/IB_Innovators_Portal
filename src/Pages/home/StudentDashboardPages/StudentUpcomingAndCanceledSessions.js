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
import { minHeight } from "@mui/system";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";




import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { MyContext } from "../../../Context/MyContext";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

import { Modal } from "@mui/material";

import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import toast from 'react-hot-toast';
import { UnapprovedLessons } from "./UnapprovedLessons";
import moment from 'moment-timezone';

const convertToUserTimezone = (date, time, timezone) => {
  // Combine date and time strings
  const dateTimeString = `${date} ${time}`;

  // Parse the combined date and time in the original timezone
  const dateTime = moment.tz(dateTimeString, 'YYYY-MM-DD HH:mm', timezone);

  // Convert the date and time to the user's timezone
  const userDateTime = dateTime.clone().tz(moment.tz.guess());

  // Return formatted time in AM/PM format
  return userDateTime.format('h:mm A');
};


// Function to format date according to user's timezone
const formatDateInUserTimezone = (date, timezone) => {
  const convertedTime = moment
    .tz(date, "YYYY-MM-DD", timezone)
    .format("YYYY MMM DD");
  return (
    <>
      {convertedTime?.split(" ")[0]}
      <br />

      {convertedTime?.split(" ")[1]}

      <br />

      {convertedTime?.split(" ")[2]}
    </>
  );
};



export function StudentUpcomingAndCanceledSessions() {
  const [students, setStudents] = useState([]);

  const [completedSessions, setCompletedSessions] = useState([]);

  const [deletedSessions, setDeletedSessions] = useState([]);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { addNotification, userDetails } = useContext(MyContext);
  const [sessionReview, setSessionReview] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      if (userDetails?.userId) {
        setLoading(true)
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("studentId", "==", userDetails?.userId));

        // Listen to the query snapshot changes
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const updatedCompletedSessions = [];
          const updatedDeletedSessions = [];
          const updatedUpcomingSessions = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const linkId = doc.id;

            
            const upcoming = data.bookedSessions || [];

            if (upcoming.length !== 0) {
              upcoming.forEach((session) => {
                updatedUpcomingSessions.push({
                  ...session,
                  linkId: linkId,
                });
              });
            }

            // Extracting completed sessions
            const completed = data?.invoices || [];

            completed.forEach((session) => {
              const {
                teacherId,
                status,
                sessionPrice,
                teacherName,
                createdAt,
                studentName,
                studentId,
                sessionInfo,
                subject,
                amount,
                ...rest
              } = session;

              updatedCompletedSessions.push({
                id: linkId,
                subject: subject,
                studentName: studentName,
                teacherName: teacherName,
                completed: true,
                ...sessionInfo, // Assuming you want to include all fields from sessionInfo
                // Add additional fields if needed
              });
            });

            // Extracting deleted sessions
            const deleted = data?.deletedSessions || [];
            deleted.forEach((session) => {
              const { id, subject, studentName, teacherName, ...rest } =
                session;
              updatedDeletedSessions.push({
                id: linkId,
                subject: data.subject,
                studentName: data.studentName,
                teacherName: data.teacherName,
                deleted: true,
                ...rest,
              });
            });
          });

          setUpcomingSessions(updatedUpcomingSessions);
          setCompletedSessions(updatedCompletedSessions);
          setDeletedSessions(updatedDeletedSessions);
          setLoading(false);
        });

        return () => {
          // Unsubscribe from the snapshot listener when the component unmounts
          unsubscribe();
        };
      }
    };

    fetchData();
  }, [userDetails?.userId]); // Trigger the effect whenever userDetails?.userId changes or on initial mount

  async function fetchUpcomingSessions() {}

  async function fetchPreviousSessions() {
    console.log("PREV", students);
  }

  const [showAll, setShowAll] = useState(false);
  const completedSessionsToShow = showAll
    ? completedSessions
    : completedSessions.slice(0, 2);

  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  const [showAllDeleted, setShowAllDeleted] = useState(false);
  const deletedSessionsToShow = showAllDeleted
    ? deletedSessions
    : deletedSessions.slice(0, 2);

  const handleShowMoreDeleted = () => {
    setShowAllDeleted(!showAllDeleted);
  };

  const [allSessions, setAllSessions] = useState([]);

  useEffect(() => {
    const timezone = moment.tz.guess();
    const now = moment.tz(timezone);
  
    // Combine deletedSessions and completedSessions
    const allSessions = [...deletedSessions, ...completedSessions];
  
    // Filter sessions to include only those from the past 48 hours
    const filteredSessions = allSessions.filter(session => {
      const sessionDateTime = moment.tz(`${session.date} ${session.time}`, 'YYYY-MM-DD HH:mm', timezone);
      // Clone the `now` variable before subtracting 48 hours to avoid mutating the `now` object
      return sessionDateTime.isAfter(now.clone().subtract(48, 'hours'));
    });
  
    // Sort filtered sessions by date and time in descending order
    const sortedSessions = filteredSessions.sort((a, b) => {
      const dateA = moment.tz(`${a.date} ${a.time}`, 'YYYY-MM-DD HH:mm', timezone);
      const dateB = moment.tz(`${b.date} ${b.time}`, 'YYYY-MM-DD HH:mm', timezone);
  
      // Compare dates first in descending order
      if (dateA.isBefore(dateB)) return 1;
      if (dateA.isAfter(dateB)) return -1;
  
      // If dates are equal, compare times in descending order
      return b.time.localeCompare(a.time);
    });
  
    setAllSessions(sortedSessions);
  }, [completedSessions, deletedSessions]);



  function formatDate(inputDate) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateObject = new Date(inputDate);
    
    const formattedDate = dateObject.toLocaleDateString('en-GB', options);
    const [day, month, year] = formattedDate.split(' ');
  
    return `${day}\n${month}\n${year}`;
  }


// PAST LESSONS PAGINATION
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = allSessions?.slice(startIndex, endIndex);


  // UPCOMING LESSONS PAGINATION

  
  const upcomingItemsPerPage = 3;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = React.useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
  const upcomingDisplayedSessions = upcomingSessions?.slice(upcomingStartIndex, upcomingEndIndex);



  // UPCOMING SESSION BUTTON FUNCTIONALITIES


  const [deactivatedStudentsList, setDeactivatedStudentsList] = useState([])

  const [bookSessionModal, setBookSessionModal] = useState(false);
  const [completeSessionModal, setCompleteSessionModal] = useState(false);

  const [editSessionModal, setEditSessionModal] = useState(false);
  const [deleteSessionModal, setDeleteSessionModal] = useState(false);
  const [deactivateStudentModal, setDeactivateStudentModal] = useState(false);

  const [reactivateStudentModal, setReactivateStudentModal] = useState(false);
  const [reactivatingReason, setReactivatingReason] = useState("");

  const [sessionPrice, setSessionPrice] = useState(0);

  const [selectedLink, setSelectedLink] = useState("");

  const [linkId, setLinkId] = useState("");

    
  const [sessionData, setSessionData] = useState({
    date: "",
    time: "",
    duration: 1,
    note: "",
    price: 0,
  });

  useEffect(() => {
    if (selectedLink?.sessionInfo) {
      console.log(selectedLink?.sessionInfo);
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

    // Function to handle completing a session for a subject
    const completeSession = async (linkId) => {
      if(sessionReview!==""){
      try {
        setSubmitting(true);
        const studentRef = doc(db, "Linked", linkId.id);
        const studentSnapshot = await getDoc(studentRef);
  
        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();
  
          // Update the document by appending the new sessionData to the existing sessionInfo array
          await updateDoc(studentRef, {
            sessionInfo: {},
            isSessionBooked: false,
          });


          const finalSessionInfo = {
            ...sessionData,
            price: selectedLink.price,
          };
      
          const invoice = {
            studentId: selectedLink.studentId,
            teacherId: selectedLink.teacherId,
            subject: selectedLink.subject,
            amount: selectedLink.price,
            createdAt: new Date(),
            studentName: selectedLink.studentName,
            teacherName: selectedLink.teacherName,
            sessionInfo: finalSessionInfo,
            status: "Pending",
            teacherReview: sessionReview
          };
      
          const docRef = doc(collection(db, "Linked"), selectedLink.id);
      
          await updateDoc(docRef, {
            invoices: arrayUnion(invoice),
          });
    
          await addNotification(`You completed a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, userDetails?.userId);
          await addNotification(`${selectedLink.teacherName} completed the session with you for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, selectedLink.studentId);
            
          toast.success("Session marked as complete")
          setCompleteSessionModal(false)
          setSubmitting(false);

        } else {
          toast.error("Failed to complete session")
          setSubmitting(false);
        }
      } catch (error) {
        toast.error("Failed to complete session")
        setSubmitting(false);
      }
    } else {toast("Please fill details")}

  
    };
  
  const addOneHour = (startTime) => {
    if (!startTime) {
      return ""; // or handle the case when startTime is not provided
    }
  
    const [hours, minutes] = startTime.split(":");
    const newTime = `${(parseInt(hours, 10) + 1).toString().padStart(2, "0")}:${minutes}`;
    return newTime;
  };

  return (
    <div
      style={{
        flex: 2,
        width: "100%",
        display: "flex",
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >

<div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1}}>



      {/* UPCOMING LESSONS */}
      <div
        className="shadowAndBorder"
        style={{
          padding: "0.5rem",
          marginTop: "0px",
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px'
        }}
      >
        <h2>Upcoming Lessons</h2>
        {
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px'}}>
          <CircularProgress />
        </div>
        :
        <>
        {upcomingDisplayedSessions?.map((item, index) => (
          <div style={{
            borderTop: index!==0 ? '2px solid #ccc' : 'none',
            margin: "10px",
          }}
          key={index}>
          <div
          style={{
            color: "black",
            padding: "10px",
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '0px'
          }}
        >
        <div style={{fontSize: "small",flex: 0.1, textAlign: 'right', borderRight: '2px solid #ccc', paddingRight: '10px'}}>
          
        {formatDateInUserTimezone(item?.date, item?.timezone)}
        </div>

          <div style={{ fontSize: "medium", flex: 0.9 }}>
            <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

            {item?.subject}

             </div>
            
          {convertToUserTimezone(item?.date, item?.time, item?.timezone)}  <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faChalkboardTeacher} /> {item?.teacherName}
          
            <br />
            Details for session: {item?.note}
          </div>



          

        </div>

        </div>
    
        
        ))}
{upcomingSessions?.length > upcomingItemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(upcomingSessions?.length / upcomingItemsPerPage)}
          page={upcomingCurrentPage}
          onChange={handleUpcomingChangePage} />
    </Stack>
    </div>
  }
        {upcomingSessions?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No Coming Lessons
          </div>
        )}
        </>
        }
        
      </div>



      {/* UNAPPROVED LESSONS */}
  <div
        className="shadowAndBorder"
  style={{
    padding: "0.5rem",
    marginTop: "0rem",
    height: 'max-content',
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
    background: 'rgba(255,255,255, 0.5)',
    backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
    WebkitBackdropFilter: 'blur(4px)', // For Safari support,
    padding: '10px',
    borderRadius: '10px'
  }}
>
  <UnapprovedLessons />

</div>


      </div>



        {/* PAST LESSONS */}
      <div
        className="shadowAndBorder"
        style={{
          padding: "0.5rem",
          flex: 1,
          marginTop: "0rem",
          height: 'max-content',
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px'
        }}
      >
        <h2>Past Lessons</h2>
        {
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px'}}>
          <CircularProgress />
        </div>
        :
        <>
        {displayedSessions?.map((item, index) => (
          <div
            key={index}
            style={{
              color: "black",
              padding: "1rem",
              margin: "10px",
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              borderTop: index!==0 ? '2px solid #ccc' : 'none',
              paddingBottom: '0.5rem'
            }}
          >
        <div style={{fontSize: "small",flex: 0.1, textAlign: 'right', borderRight: '2px solid #ccc', paddingRight: '10px'}}>
        {formatDateInUserTimezone(item?.date, item?.timezone)}
        </div>

            <div style={{ fontSize: "medium", flex: 0.9 }}>
              <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

              {item?.subject}

              {item?.completed && <span style={{fontSize: '12px', padding: '1px 5px', border: '1px solid green', borderRadius: '10px', color: 'green'}}>Completed</span>}
              {item?.deleted && <span style={{fontSize: '12px', padding: '1px 5px', border: '1px solid red', borderRadius: '10px', color: 'red'}}>Cancelled</span>}
              </div>
              
              {convertToUserTimezone(item?.date, item?.time, item?.timezone)}  <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faChalkboardTeacher} /> {item?.teacherName}
          
          <br />
          Details for session: {item?.note}
            </div>
          </div>
        ))}

{allSessions?.length >itemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(allSessions?.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage} />
    </Stack>
    </div>
}
{allSessions?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No Past Lessons
          </div>
        )}

        </>
        }


      </div>




      <Modal
        open={completeSessionModal}
        onClose={() => {
          setCompleteSessionModal(false);
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
            <div style={{
              padding: "20px", flex: 1, overflow: 'auto'}}>
            <h2 style={{ textAlign: "left" }}>Complete Session</h2>
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
                    Enter Session Review:
                  </p>
                <textarea
                  name="Enter session review"
                  value={sessionReview}
                  onChange={(e) => {
                    setSessionReview(e.target.value);
                  }}
                  placeholder="Please enter details here..."
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
                  onClick={() => setCompleteSessionModal(false)}
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
                    COMPLETING
                  </LoadingButton>
                ) : (
                  <Button
                  onClick={() => completeSession(selectedLink)}
                    variant="contained"
                    color="success"
                  >
                    COMPLETE
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
