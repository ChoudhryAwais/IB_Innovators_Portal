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
  orderBy
} from "firebase/firestore";
import "./ProcessedForms.css";

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Button } from "@mui/material";
import { toast } from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProcessedTutorForm = () => {

  
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);


  const [tutors, setTutors] = useState([]);

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedTutorForm");
    const orderCollectionRef = collection(customDocRef, "processedTutorForm");

    
    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"));

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
        toast.error("Error fetching data");
      }
    );

    // Don't forget to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  };


  
  const handleDeleteClick = async (student) => {
    try {
      setLoading(true);
      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "processedTutorForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "processedTutorForm"
      );

      const studentDocRef = doc(prevOrderCollectionRef, student.id); // Get the document reference with the student.id
      await deleteDoc(studentDocRef); // Delete the document

      setShowModal(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Error deleting student form");
      console.error("Error deleting student form: ", error);
    } finally {
      setLoading(false);
    }
  };

    // PROCESSED TUTOR FORMS PAGINATION
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
      const dateObject = new Date(timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000);
    
      // Format time as "hh:mm A"
      const formattedTime = dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
      // Format date as "DD/MM/YYYY"
      const formattedDate = dateObject.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
      // Combine formatted time and date
      const formattedDateTime = `${formattedTime} - ${formattedDate}`;
    
      return formattedDateTime;
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
      marginBottom: '10px'
    }}>
        <h2 style={{textAlign: 'left'}}>Processed Forms</h2>
      {displayedSessions.map((tutor, index) => (
       <Accordion style={{
        background: 'rgba(255,255,255, 0.5)',
        borderRadius: '5px', }} key={index}>
       <AccordionSummary
         expandIcon={<ExpandMoreIcon />}
         aria-controls="panel1-content"
         id="panel1-header"
       >
         <div
             style={{ flex: 1, height: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
            <div >
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
                <strong>Assignments:</strong> {tutor.assignments.join(", ")}
              </div>
              <div>
                <strong>Curricula:</strong> {tutor.curricula.join(", ")}
              </div>
              <div>
              <strong>Resume:</strong> {tutor.resume ? 
        <a href={tutor.resume} download>Download Resume</a> 
        : "Not provided"}
              </div>


              
              <Button
                onClick={() => {
                  setShowModal(true);
                  setSelectedLink(tutor);
                }}
                variant="outlined"
                color="error"
                style={{ width: "100%", marginTop: "15px" }}
              >
                Delete
              </Button>

            </div>
          
          </AccordionDetails>
          </Accordion>
      ))}


{tutors?.length >itemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginTop: '20px'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(tutors?.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage} />
    </Stack>
    </div>
}



{tutors?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#ccc",
              fontSize: "1.5rem",
            }}
          >
            No Processed Forms
          </div>
        )}


      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Please confirm to delete this form."}</DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false);
            }}
          >
            cancel
          </Button>
          <Button
            disabled={loading}
            color="error"
            variant="contained"
            onClick={() => handleDeleteClick(selectedLink)}
          >
            {loading ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
        
    </div>
  );
};

export default ProcessedTutorForm;
