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
import { Modal } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';

import toast from 'react-hot-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function JobList() {

  
  const { userDetails } = useContext(MyContext);
  const [loading,setLoading] = useState(false)

  const [receivedData, setReceivedData] = useState([])


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const blogsRef = collection(db, 'UpcomingCourses');
      const unsubscribe = onSnapshot(blogsRef, (snapshot) => {
        const blogsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceivedData(blogsArray);
        
      setLoading(false)
      });

      return () => {
        // Unsubscribe from the snapshot listener when component unmounts
        unsubscribe();
      };
    };

    fetchData();
  }, []);


  // PAST LESSONS PAGINATION
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions =  receivedData?.slice(startIndex, endIndex);


  return (
    <div
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
      <h2 style={{ textAlign: "left" }}>Upcoming Courses</h2>

      {
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px'}}>
          <CircularProgress />
        </div>
        :
        <>
        

      {displayedSessions.map((item, index) => {
const formatDateString = (dateString) => {
const date = new Date(dateString);
const month = date.toLocaleString("default", { month: "short" });
const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits with leading zero if needed
return `${month} ${day}`;
};

const formattedStartDate = formatDateString(item.startDate);
const formattedEndDate = formatDateString(item.endDate);
const formattedLastDate = formatDateString(item.lastDate);


            return (
              <div
                style={{
                  padding: "1rem",
                  borderTop: index !== 0 ? "2px solid #fff" : 'none',
                }}
              >
                <span >
                  <b>{item.heading}:</b>{" "}<br/>
                </span>
                Session {item.sessionNumber}: {item.tagline}
                <p style={{ color: "rgb(121, 121, 121)", lineHeight: '30px' }}>
                  Starting from {formattedStartDate} till {formattedEndDate}
                  , to enroll fill out the form on our 
                  <span
                    style={{
                      color: "white",
                      backgroundColor: "rgb(14, 56, 136)",
                      padding: "5px",
                      borderRadius: "5px",
                      whiteSpace: "nowrap",
                      cursor: 'pointer',
                      marginLeft: '5px'
                    }}
                    onClick={() => {window.open("https://www.ibinnovators.com/revisionCourses", "_blank")}}

                  >
                    Main Website
                  </span>{" "}
                  <span style={{color: 'red'}}>(Last date to Register {formattedLastDate})</span>
                </p>
              </div>
            );
      })}

      {
        receivedData?.length > itemsPerPage && 
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
            count={Math.ceil(receivedData?.length / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
          />
        </Stack>
      </div>
      }
{receivedData?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No courses at the moment
          </div>
        )}

        </>
        }
{/* 
<Modal
  open={showModal}
  TransitionComponent={Transition}
  aria-labelledby="parent-modal-title"
  aria-describedby="parent-modal-description"
>
        <ApplicationForm item={selectedItem} handleClose={closingModal} />
      </Modal> */}
    </div>
  );
}
