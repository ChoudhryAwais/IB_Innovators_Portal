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
import { minHeight } from "@mui/system";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";


import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { MyContext } from "../../Context/MyContext";

import { Modal } from "@mui/material";

import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import toast from 'react-hot-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function TeacherUpcomingAndCanceledSessions() {
  const userId = localStorage.getItem("userId");
  const [students, setStudents] = useState([]);

  const [completedSessions, setCompletedSessions] = useState([]);

  const [deletedSessions, setDeletedSessions] = useState([]);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [sessionReview, setSessionReview] = useState("")
  const [loading, setLoading] = useState(false)
  const { addNotification } = useContext(MyContext);

  useEffect(() => {
    const fetchData = () => {
      if (userId) {
        setLoading(true)
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("teacherId", "==", userId));

        // Listen to the query snapshot changes
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const updatedCompletedSessions = [];
          const updatedDeletedSessions = [];
          const updatedUpcomingSessions = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const linkId = doc.id;

            const upcoming = data?.sessionInfo;

            if (upcoming && Object.keys(upcoming).length !== 0) {
              updatedUpcomingSessions.push({
                ...upcoming,
                id: linkId,
                subject: data.subject,
                studentName: data.studentName,
                teacherName: data.teacherName,
                ...data
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
          setLoading(false)
        });

        return () => {
          // Unsubscribe from the snapshot listener when the component unmounts
          unsubscribe();
        };
      }
    };

    fetchData();
  }, [userId]); // Trigger the effect whenever userId changes or on initial mount


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
    const myAllSessions = [...deletedSessions, ...completedSessions].sort(
      (a, b) => {
        // Compare dates first in descending order
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) {
          return dateComparison;
        }

        // If dates are equal, compare times in descending order
        return b.time.localeCompare(a.time);
      }
    );

    setAllSessions(myAllSessions);
  }, [completedSessions, deletedSessions]);



  function formatDate(inputDate) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateObject = new Date(inputDate);
    
    const formattedDate = dateObject.toLocaleDateString('en-GB', options);
    const [day, month, year] = formattedDate.split(' ');
  
    return `${day}\n${month}\n${year}`;
  }


// PAST LESSONS PAGINATION
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = allSessions?.slice(startIndex, endIndex);


  // UPCOMING LESSONS PAGINATION

  
  const upcomingItemsPerPage = 5;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = React.useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingCurrentPage;
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
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
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
    
          await addNotification(`You completed a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, userId);
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
  
    // Function to handle booking a session for a subject
    const editSession = async (linkId) => {
      if (Object.values(sessionData).length===0 || !sessionData.date ||!sessionData.time || !sessionData.note) {
        toast("Please fill all details");
      }
      else {
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
          await addNotification(`You updated a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, userId);
          await addNotification(`${selectedLink.teacherName} updated the session with you for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, selectedLink.studentId);
           

          toast.success("Session Updated");
          setEditSessionModal(false);
        } else {
          toast.error("Failed to update session");
        }
      } catch (error) {
        toast.error("Failed to update session");
      } finally{

        setSubmitting(false);}
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

      const updatedCompletedSessions = [...(studentData.deletedSessions || [])];
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

        await addNotification(`You cancelled a session with ${selectedLink.studentName} for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, userId);
          await addNotification(`${selectedLink.teacherName} cancelled the session with you for ${selectedLink.subject} on ${sessionData.date} | ${sessionData.time}.`, selectedLink.studentId);
           

        toast.success("Session Cancelled")
      } else {
        toast.error("Failed to cancel session")
      }
    } else {
      toast.error("Failed to cancel session")
    }
  } catch (error) {
    toast.error("Failed to cancel session")
  }
  finally{
    setSubmitting(false);
  }
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
      <div
        style={{
          padding: "0.5rem",
          marginTop: "0px",
          flex: 1,
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
            borderTop: index!==0 ? '2px solid #fff' : 'none',
            margin: "10px",
          }}
          key={index}>
          <div
          style={{
            color: "black",
            padding: "1rem",
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '0px'
          }}
        >
        <div style={{fontSize: "small",flex: 0.1, textAlign: 'right'}}>
          {formatDate(item?.date)}
        </div>

          <div style={{ fontSize: "medium", flex: 0.9 }}>
            <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

            {item?.subject}

             </div>
            
           Details for session: {item?.note}
            <br />
            {item?.time} <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faGraduationCap} /> {item?.studentName}
          
          </div>



          

        </div>

        <div style={{display: 'flex', flexWrap: 'wrap',
                        flex: 1, marginBottom: '10px', justifyContent: 'space-between'}}>

<Button style={{flex: 1, marginRight: '5px'}} variant="outlined" color="error" onClick={() => {
                        setDeleteSessionModal(true);
                        setSelectedLink(item);
                      }}>
  CANCEL
</Button>

<Button  style={{flex: 1, marginRight: '5px'}} onClick={() => {
                        setEditSessionModal(true);
                        setSelectedLink(item);
                      }} variant="outlined">UPDATE</Button>


                    <Button  style={{flex: 1}} onClick={() => {
                        setCompleteSessionModal(true);
                        setSelectedLink(item);
                      }} variant="contained" color="success">
  COMPLETE
</Button>


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

      <div
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
              borderTop: index!==0 ? '2px solid #fff' : 'none',
              paddingBottom: '0.5rem'
            }}
          >
          <div style={{fontSize: "small",flex: 0.1, textAlign: 'right'}}>
            {formatDate(item?.date)}
          </div>

            <div style={{ fontSize: "medium", flex: 0.9 }}>
              <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

              {item?.subject}

              {item?.completed && <span style={{fontSize: '12px', padding: '1px 5px', border: '1px solid green', borderRadius: '10px', color: 'green'}}>Completed</span>}
              {item?.deleted && <span style={{fontSize: '12px', padding: '1px 5px', border: '1px solid red', borderRadius: '10px', color: 'red'}}>Cancelled</span>}
              </div>
              
             Details for session: {item?.note}
              <br />
              {item?.time} <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faGraduationCap} /> {item?.studentName}
            
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

      

<Dialog
        open={deleteSessionModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {setDeleteSessionModal(false)}}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Are you sure you want to cancel this sesson?"}</DialogTitle>
        
        <DialogActions >
          <Button  variant="outlined" color="error" onClick={() => {
            setDeleteSessionModal(false);
            }}>NO</Button>
  {
   !submitting ?

    <Button variant="contained" color="success" onClick={() => deleteSession(selectedLink)}>YES</Button>
          :
          <LoadingButton
        loading
        loadingPosition="start"
        startIcon={<SaveIcon />}
        variant="outlined"
      >
        CANCELLING
      </LoadingButton>

  }
          

        </DialogActions>
      </Dialog>



      <Modal
        open={editSessionModal}
        onClose={() => {setEditSessionModal(false)}}
        
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
              background: 'rgba(255,255,255, 0.6)',
              backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
              WebkitBackdropFilter: 'blur(4px)', // For Safari support,
              borderRadius: '10px',
              
            }}
          >

<div style={{
              padding: "20px", flex: 1, overflow: 'auto'}}>

<h2 style={{ textAlign: "left" }}>Update Session</h2>
          <p style={{ textAlign: "center", fontSize: "1.8rem", color: '#1e1e1e' }}>
            {selectedLink?.subject}
          </p>
          <p style={{ textAlign: "center", fontSize: "1.2rem" , color: '#1e1e1e'}}>
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
                  borderRadius: '10px',
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
                    borderRadius: '5px'
                  }}
                />
              </div>
              <div style={{ flex: 1, width: "100%", marginBottom: "20px" }}>
                <p style={{ marginRight: "10px", fontSize: "medium" }}>
                  Time: {sessionData.time && <>({sessionData.time} - {addOneHour(sessionData.time)})</>}
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
                    borderRadius: '5px'
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
                    borderRadius: '5px'
                  }}
                />
              </div>

            </form>
          </div>


          <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "10px",
                    width: '100%',
                    marginTop: '20px'
                  }}
                >
                  <Button variant="outlined" color="error" 
                  onClick={() => setEditSessionModal(false)}>
                  CANCEL
                </Button>
                { submitting ?
                <LoadingButton
                loading
                loadingPosition="start"
                startIcon={<SaveIcon />}
                variant="outlined"
              >
                UPDATING
              </LoadingButton>
              :
              <Button 
              onClick={() => {editSession(selectedLink)}}
              variant="contained" color="success">
                UPDATE
                </Button>
                }
                </div>

            
          </div>
          </div>
          </div>
      </Modal>
      
    </div>
  );
}
