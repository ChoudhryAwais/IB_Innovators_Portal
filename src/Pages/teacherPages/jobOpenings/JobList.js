import React, { useState, useContext, useEffect } from "react";

import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { ApplicationForm } from "./ApplicationForm";
import { Modal } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';

import toast from 'react-hot-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function JobList() {

  
  const { userDetails } = useContext(MyContext);
  // const data = [
  //   {
  //     id: 120941214,
  //     subject: "Chemistry",
  //     studentName: "Aikie",
  //     country: "United Kingdom",
  //     credits: 0,
  //     yearOfGraduation: "May 2024",
  //     timeZone: "GMT",
  //     slotRequired: {day: "Thursday", time: "3PM - 6PM"},
  //     requestedHours: 5,
  //     tutorTier: 'Higher Tier',
  //     gradePredicted: 6,
  //     gradeAimed: 7,
  //     startDate: "Immediately"
  //   },
    
  // ];

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState(userDetails?.subjects ? userDetails?.subjects : {});
  

const fetchData = () => {
  setLoading(true);
  try {
    // Use onSnapshot to listen for real-time updates
  const userListRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(
      query(userListRef, orderBy('createdOn', 'desc')), // Order by 'createdOn' field in descending order
      (querySnapshot) => {
        const orderData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() })) // Include the document id in the data
          .filter((order) => {
            const orderSubject = order.subject;

            const filteredSubjects = Object.entries(subjects)
            .filter(([subject, value]) => value === true)
            .map(([subject]) => subject);
    
        // Check if the order subject is included in the filtered subjects
        return filteredSubjects.includes(orderSubject);
          });

        setData(orderData);
        setLoading(false)
      }
    );

    // Return the unsubscribe function to stop listening when the component unmounts
    return unsubscribe;
  } catch (e) {
    toast.error('Error fetching data');
    setLoading(false)
  } 
};
  // useEffect to call fetchData when the component mounts
  useEffect(() => {
    const unsubscribe = fetchData();
  
    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  // PAST LESSONS PAGINATION
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions =  data?.slice(startIndex, endIndex);

  function closingModal(e) {
    setShowModal(e);
  }

  return (
    <div
    className="shadowAndBorder"
    style={{
      marginTop: "0px",
      flex: 1,
      height: "max-content",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
      background: 'rgba(255,255,255, 0.5)',
      backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
      WebkitBackdropFilter: 'blur(4px)', // For Safari support,
      padding: '10px',
      borderRadius: '10px', 
    }}
    >
      <h2 style={{ textAlign: "left" }}>Jobs</h2>

      {
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px'}}>
          <CircularProgress />
        </div>
        :
        <>
        

      {displayedSessions.map((item, index) => (
        <div
          style={{ flex: 1, borderTop: index !== 0 ? "2px solid #fff" : 'none', padding: "10px" }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <div style={{ fontSize: "large" }}>{item.subject}</div>

            <div style={{ fontSize: "small", textAlign: 'right' }}>Requested by {item.studentName}</div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <div style={{ fontSize: "medium" }}>{item?.country}</div>

            <div style={{ fontSize: "small", transform: "translateY(-12px)" }}>
            Hourly Rate (USD): ${item?.tutorHourlyRate}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: 'center'
            }}
          >
            <div>
              <FontAwesomeIcon
                style={{ marginLeft: "10px" }}
                icon={faGraduationCap}
              />{" "}
              {item.studentName}
            </div>

            <div>
              <Button variant="contained"
                
                onClick={() => {
                  setShowModal(true);
                  setSelectedItem(item);
                }}
                disabled={
                  item?.applicants &&
                  item.applicants.some((applicant) => applicant.submittedBy === userDetails?.userId)
                }
                
              >
                {item?.applicants &&
                  item.applicants.some((applicant) => applicant.submittedBy === userDetails?.userId) ? "APPLIED" : "APPLY"}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {
        data?.length > itemsPerPage && 
      <div
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Stack style={{ marginTop: "10px" }} spacing={2}>
          <Pagination
            count={Math.ceil(data?.length / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
          />
        </Stack>
      </div>
      }
{data?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No jobs at the moment
          </div>
        )}

        </>
        }

<Modal
  open={showModal}
  TransitionComponent={Transition}
  aria-labelledby="parent-modal-title"
  aria-describedby="parent-modal-description"
>
        <ApplicationForm item={selectedItem} handleClose={closingModal} />
      </Modal>
    </div>
  );
}
