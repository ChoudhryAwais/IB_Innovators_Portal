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
import "./ProcessedRevisionCoursesForm.css";

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Button } from "@mui/material";
import { toast } from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProcessedRevisionCoursesForm = () => {
  const [contactUsSubmissions, setContactUsSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedRevisionCoursesForm");
    const orderCollectionRef = collection(customDocRef, "processedRevisionCoursesForm");

    
    const orderedQuery = query(
      orderCollectionRef,
      orderBy("processedAt", "desc")
    );
    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });

        
        fetchedData.sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate());
        
        setContactUsSubmissions(fetchedData);
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
      const prevCustomDocRef = doc(prevOrdersRef, "processedRevisionCoursesForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "processedRevisionCoursesForm"
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
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = React.useState(1);
  
    const handleChangePage = (event, newPage) => {
      setCurrentPage(newPage);
    };
  
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex);
  
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
      {displayedSessions.map((item, index) => (
       <Accordion key={index}>
       <AccordionSummary
         expandIcon={<ExpandMoreIcon />}
         aria-controls="panel1-content"
         id="panel1-header"
       >
         <div
             style={{ flex: 1, height: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
           >
             <div>
      {item.userDetails?.email}
      </div>

           </div>
       
       </AccordionSummary>
       <AccordionDetails>
            
      
       <div>

<div style={{borderBottom: '1px solid #ccc', marginBottom: '1rem', paddingBottom: '1rem'}}>
  

<div>
  <strong>Submitted By UserType:</strong> {item?.userType}
</div>
<div>
  <strong>User Timezone:</strong> {item?.timeZone}
</div>
<div>
  <strong>Final Exam Date:</strong>{" "}
    {item.finalExamDate}
</div>
<div>
  <strong>Objective:</strong>{" "}
  <ul>
    {item.objective?.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
</div>
<div>
  <strong>Seeking Tutoring For:</strong>{" "}
  <ul>
    {item.seekingTutoringFor?.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
</div>
<div>
  <strong>How often to take lessons:</strong>{" "}
  <ul>
    {item?.howOftenToTakeLesson?.map((item) => (
      <li>{item}</li>
    ))}
  </ul>
</div>


<div>
  <strong>Tutor Support Type:</strong> Certified IB Examiner
</div>

<div>
  <strong>Course Type:</strong> {item?.selectedCourse?.title}
</div>


<div>
  <strong>Total Teaching Hours:</strong> {item?.selectedCourse?.hours * item?.seekingTutoringFor?.length}
</div>

<div>
  <strong>Price:</strong> £ {item?.quotedPrice}
</div>
</div>


{/* GUIDANCE AND SUPPORT */}
<div style={{borderBottom: '1px solid #ccc', marginBottom: '1rem', paddingBottom: '1rem'}}>
    <div>
<strong>Want Guidance and Support:</strong>{" "}
{item?.wantGuidanceAndSupport}
</div>
{
item?.wantGuidanceAndSupport === "yes" &&
<>
<div>
    <strong>Guidance & Support Subjects:</strong>
    <ul>
      {item?.guidanceAndSupportSubjects?.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>

  <div>
<strong>Guidance and Support Objective:</strong>{" "}
{item?.guidanceObjectiveTitle}
</div>


  <div>
    <strong>Tutor Level:</strong>{" "}
    {item?.guidanceObjective?.level}
  </div>
  
  <div>
    <strong>Tutor Support Type:</strong>{" "}
    {item?.guidanceObjective?.diploma}
  </div>
  
  
  <div>
    <strong>Price:</strong>{" "}
    £ {item?.guidancePrice}
  </div>
</>
}
</div>

<>
  {/* Student Information */}
  <div>
    <strong>Student's Information:</strong>
  </div>
  <div>
    <strong>First Name:</strong>{" "}
    {item?.userDetails?.firstName}
  </div>
  <div>
    <strong>Last Name:</strong>{" "}
    {item?.userDetails?.lastName}
  </div>
  <div>
    <strong>Email:</strong> {item?.userDetails?.email}
  </div>
  <div>
    <strong>Phone:</strong> {item?.userDetails?.phone}
  </div>
  <div>
    <strong>Address:</strong> {item?.userDetails?.address || "N/A"}
  </div>
  <div>
    <strong>City:</strong> {item?.userDetails?.city || "N/A"}
  </div>
  <div>
    <strong>ZIP:</strong> {item?.userDetails?.zip || "N/A"}
  </div>
  <div>
    <strong>Country:</strong> {item?.userDetails?.country?.label || "N/A"}
  </div>
  <div>
    <strong>GMT:</strong> {item?.userDetails?.gmtTimezone || "N/A"}
  </div>
  <br />
  {/* Parent Information */}
  <div>
    <strong>Parent's Information:</strong>
  </div>
  <div>
    <strong>First Name:</strong>{" "}
    {item?.userDetails?.parentFirstName}
  </div>
  <div>
    <strong>Last Name:</strong>{" "}
    {item?.userDetails?.parentLastName}
  </div>
  <div>
    <strong>Email:</strong>{" "}
    {item?.userDetails?.parentEmail}
  </div>
  <div>
    <strong>Phone:</strong>{" "}
    {item?.userDetails?.parentPhone}
  </div>
  <div>
    <strong>Relation:</strong>{" "}
    {item?.userDetails?.relation}
  </div>
  </>

  
  <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setShowModal(true);
                    setSelectedLink(item);
                  }}
                  style={{marginTop: '1rem'}}
                  fullWidth
                >
                  Delete
                </Button>


</div>
          
          </AccordionDetails>
          </Accordion>
      ))}


{contactUsSubmissions?.length >itemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginTop: '20px'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(contactUsSubmissions?.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage} />
    </Stack>
    </div>
}

{contactUsSubmissions?.length === 0 && (
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

export default ProcessedRevisionCoursesForm;
