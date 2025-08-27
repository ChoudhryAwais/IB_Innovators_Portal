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

import { Radio, RadioGroup, FormControlLabel } from "@mui/material";



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
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

import { Modal } from "@mui/material";

import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import toast from 'react-hot-toast';
import moment from 'moment-timezone';
import CustomModal from "../../../Components/CustomModal/CustomModal";

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});




export function UnapprovedLessons() {
  const [students, setStudents] = useState([]);

  const [rating, setRating] = useState(0);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [unApprovedSessions, setUnApprovedSessions] = useState([]);

  const [deletedSessions, setDeletedSessions] = useState([]);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { addNotification, userDetails } = useContext(MyContext);
  const [sessionReview, setSessionReview] = useState("")
  const [loading, setLoading] = useState(false)


  const [selectedOption, setSelectedOption] = useState("Approved");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };


  async function updateInvoiceStatusAndReview(linkId, invoiceId) {
    if(
      rating!==0 && sessionReview!==""
    ){
    try {
      setSubmitting(true)
        // Reference to the document in the "Linked" collection
        const linkedRef = doc(db, "Linked", linkId);

        // Fetch the document from the "Linked" collection
        const linkedDocSnap = await getDoc(linkedRef);

        // Check if the document exists
        if (linkedDocSnap.exists()) {
            // Extract the invoice array from the document data
            const invoices = linkedDocSnap.data().invoices || [];

            // Find the index of the invoice with the matching id
            const index = invoices.findIndex(invoice => invoice.id === invoiceId);

            // If the invoice is found
            if (index !== -1) {
                // Update the status and studentReview fields of the invoice
                invoices[index].status = "Approved";
                invoices[index].studentReview = sessionReview;
                invoices[index].rating = rating;


                // Update the document with the modified invoice array
                await updateDoc(linkedRef, { invoices });
                toast.success("Review submitted");
                await addNotification(`You reviewed the session with ${selectedLink.teacherName} for ${selectedLink.subject} conducted on ${sessionData.date} | ${sessionData.time}.`, userDetails?.userId);
            await addNotification(`${selectedLink.studentName} reviewed the session with you for ${selectedLink.subject} conducted on ${sessionData.date} | ${sessionData.time}.`, selectedLink.teacherId);
            
            } else {
              toast.error("Session not found");
            }
        } else {
          toast.error("Subscription not found");
            // console.log("Linked document not found");
        }
    } catch (error) {
      toast.error("Error updating review");
    } finally{
      setCompleteSessionModal(false);
      setSessionReview("");
      setSelectedOption("Approved")
      setSubmitting(false)
    }

  }
  else {
    toast("Please fill all details")
  }
}


  useEffect(() => {
    const fetchData = () => {
      if (userDetails?.userId) {
        setLoading(true)
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("studentId", "==", userDetails?.userId));

        // Listen to the query snapshot changes
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const updatedCompletedSessions = [];
          var unApprovedLessons = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const linkId = doc.id;

            // Extracting completed sessions
            const completed = data?.invoices || [];

            completed.forEach((invoice) => {
                if (!invoice.studentReview) {
                    unApprovedLessons.push({...invoice, linkId: linkId});
                }
            });           

          });
        //   console.log("unApprovedLessons", unApprovedLessons)
          setUnApprovedSessions(unApprovedLessons);
          setLoading(false);
        });

        return () => {
          unsubscribe();
        };
      }
    };

    fetchData();
  }, [userDetails?.userId]);





  const [allSessions, setAllSessions] = useState([]);




  function formatDate(inputDate) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateObject = new Date(inputDate);
    
    const formattedDate = dateObject.toLocaleDateString('en-GB', options);
    const [day, month, year] = formattedDate.split(' ');
  
    return `${day}\n${month}\n${year}`;
  }


// PAST LESSONS PAGINATION
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = unApprovedSessions?.slice(startIndex, endIndex);




  // UPCOMING SESSION BUTTON FUNCTIONALITIES

  const [completeSessionModal, setCompleteSessionModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
    
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
    <>


        {/* PAST LESSONS */}
      <div
      >
        <h2>Pending Approval</h2>
        {
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px'}}>
          <CircularProgress />
        </div>
        :
        <>
        {displayedSessions?.map((item, index) => (
            <div key={index}>
          <div
            style={{
              color: "black",
              margin: "10px",
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              borderTop: index!==0 ? '2px solid #ccc' : 'none', paddingTop: '20px'
            }}
          >
        <div style={{fontSize: "small",flex: 0.1, textAlign: 'right', borderRight: '2px solid #ccc', paddingRight: '10px'}}>
        
          {formatDateInUserTimezone(item?.sessionInfo?.date, item?.sessionInfo?.timezone)}
        </div>

            <div style={{ fontSize: "medium", flex: 0.9 }}>
              <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>

              {item?.subject}

              {/* {item?.status && <span style={{fontSize: '12px', padding: '1px 5px', border: '1px solid red', borderRadius: '10px', color: 'red'}}>{item?.status}</span>} */}
              
             </div>
             {convertToUserTimezone(item?.sessionInfo?.date, item?.sessionInfo?.time, item?.sessionInfo?.timezone)} 
             <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faChalkboardTeacher} /> {item?.teacherName}
          
          <br />
          Details for session: {item?.sessionInfo?.note}
            </div>
          </div>
          <Button onClick={() => {
            setSelectedLink(item);
            setCompleteSessionModal(true)
          }} variant="outlined" style={{width: '100%',
          marginBottom: '10px'}}>
          REVIEW Session
        </Button>
        </div>
        ))}

{unApprovedSessions?.length >itemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(unApprovedSessions?.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage} />
    </Stack>
    </div>
}
{unApprovedSessions?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No pending approvals
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
        <CustomModal>
            <h2 style={{ textAlign: "left" }}>Review Session</h2>
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
              {selectedLink?.teacherName}
            </p>
            <p
              style={{
                color: "#1e1e1e",
                textAlign: "center",
                fontSize: "1.2rem",
              }}
            >
              ({selectedLink?.sessionInfo?.date} | {selectedLink?.sessionInfo?.time} )
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

<div style={{flex: 1, textAlign: 'center'}}>
      <Typography component="legend">Rate this session</Typography>
      <Rating
        size="large"
        name="simple-controlled"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue);
        }}
      />
      </div>


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


                


                {/* <div style={{ flex: 1, width: "100%", marginBottom: "5px" }}>
      <p style={{ marginRight: "10px", fontSize: "medium" }}>
        Would you like the payment to be transferred to {selectedLink?.teacherName}?
      </p>
      <RadioGroup
        aria-label="payment-option"
        name="payment-option"
        value={selectedOption}
        onChange={handleOptionChange}
      >
        <FormControlLabel
          value="Approved"
          control={<Radio />}
          label="Approve"
        />
        <FormControlLabel
          value="Pending"
          control={<Radio />}
          label="Hold Payment"
        />
      </RadioGroup>
    </div> */}
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
                  onClick={() => {
                    
      setSessionReview("");
      setSelectedOption("Approved")
                    setCompleteSessionModal(false)}}
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
                  onClick={() => updateInvoiceStatusAndReview(selectedLink.linkId, selectedLink.id)}
                    variant="contained"
                    color="success"
                  >
                    SUBMIT
                  </Button>
                )}
              </div>
            </div>
            </CustomModal>
      </Modal>
      
    </>
  );
}
