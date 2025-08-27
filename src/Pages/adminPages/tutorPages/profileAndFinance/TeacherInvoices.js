import React, { useEffect, useState, useContext } from "react";
import { db } from "../../../../firebase";
import { collection, getDocs, query, where, onSnapshot, getDoc, doc, updateDoc } from "firebase/firestore";
import styles from "./TeacherInvoices.module.css";
import { useNavigate } from "react-router-dom";



import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mui/material";
import { toast } from "react-hot-toast";

export default function TeacherInvoices({userDetails, userId}) {
  const [invoices, setInvoices] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("teacherId", "==", userId));
  
        // Use onSnapshot to listen for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const paidInvoices = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
  
            (data.invoices || []).forEach((invoice) => {
              paidInvoices.push({ ...invoice, linkId: doc.id });
            });
          });
  
          setInvoices(paidInvoices);
        });
  
        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      }
    };
  
    fetchData();
  }, [userId]);

  const [finalFilteredInvoices, setFinalFilteredInvoices] = useState([]);
  const [showAllInvoices, setShowAllInvoices] = useState(false);




  





  
  const [thisMonthEarning, setThisMonthEarning] = useState(0)
  useEffect(() => {
    const currentMonthInvoice = calculateMonthlyInvoice(
      invoices,
      new Date().getMonth()+1,
      new Date().getFullYear()
    );

    

    setThisMonthEarning(currentMonthInvoice);

  }, [invoices]);



  
  const [monthlyInvoiceAmount, setMonthlyInvoiceAmount] = useState(0);
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth()+1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());


  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date);
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });
    


    const totalAmount = filteredInvoices.reduce(
      (total, invoice) => total + parseFloat(invoice?.tutorHourlyRate),
      0
    );

    return totalAmount;
  };


  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate(); // Convert Firebase timestamp to JavaScript Date
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });
  
    // Sort the filtered invoices in descending order based on invoice.createdAt
    const sortedInvoices = filteredInvoices.sort((a, b) => {
      const dateA = a.createdAt.toDate();
      const dateB = b.createdAt.toDate();
      return dateB - dateA;
    });
  
    return sortedInvoices;
  };
  

  useEffect(() => {
    const calculatedAmount = calculateMonthlyInvoice(
      invoices,
      targetMonth,
      targetYear
    );
    setMonthlyInvoiceAmount(calculatedAmount); // Update state here

  }, [invoices, targetMonth, targetYear]);
  

  const handleMonthChange = (e) => {
    setTargetMonth(parseFloat(e.target.value));
    setShowAllInvoices(false)
  };

  const handleYearChange = (e) => {
    setTargetYear(parseFloat(e.target.value));
    setShowAllInvoices(false)
  };


  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


  

  async function handleApproveSession(linkId, invoiceId) {

    try {
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
                invoices[index].studentReview = "Admin Reviewed";
                invoices[index].rating = 5;


                // Update the document with the modified invoice array
                await updateDoc(linkedRef, { invoices });
                toast.success("Session Approved");
            //     await addNotification(`You reviewed the session with ${selectedLink.teacherName} for ${selectedLink.subject} conducted on ${sessionData.date} | ${sessionData.time}.`, userId);
            // await addNotification(`${selectedLink.studentName} reviewed the session with you for ${selectedLink.subject} conducted on ${sessionData.date} | ${sessionData.time}.`, selectedLink.teacherId);
            
            } else {
              toast.error("Session not found");
            }
        } else {
          toast.error("Subscription not found");
        }
    } catch (error) {
      toast.error("Error approving session");
    }

  
}

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = invoice.createdAt.toDate(); // Convert Firebase timestamp to JavaScript Date
    const month = invoiceDate.getMonth() + 1; // Adding 1 because getMonth() is zero-based
    const year = invoiceDate.getFullYear();
  
    return { month, year };
  }
  
  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = [];
  
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice);
  
      // Check if the combination of month and year already exists in the array
      const exists = uniqueMonthsAndYears.some(
        (item) => item.month === month && item.year === year
      );
  
      // If it doesn't exist, add it to the array
      if (!exists) {
        uniqueMonthsAndYears.push({ month, year });
      }
    });
  
    // Sort the array in descending order based on year and month
    uniqueMonthsAndYears.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Sort by year in descending order
      } else {
        return b.month - a.month; // If years are the same, sort by month in descending order
      }
    });
  
    return uniqueMonthsAndYears;
  }
  
  
  const result = getUniqueMonthsAndYears(invoices);



  // DATE AND TIME CALCULATIONS

  function convertToAMPM(time24) {
    // Validate input
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time24)) {
      console.error("Invalid time format. Please provide a valid 24-hour time (HH:mm).");
      return null;
    }
  
    // Convert to 12-hour format
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseFloat(hours, 10);
    const ampm = parsedHours >= 12 ? 'PM' : 'AM';
    const hours12 = parsedHours % 12 || 12;
  
    return `${hours12}:${minutes} ${ampm}`;
  }
  


  return (
    <div style={{flex: 1, gap: '10px', display: 'flex', flexDirection: 'column'}}>


      <div 
      className="shadowAndBorder"
      style={{
          marginTop: "0px",
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px', 
        }}>
          
      <h2 style={{ textAlign: "left" }}>Earnings This Month</h2>
      <h1 style={{ textAlign: "center", fontSize: '3rem' }}>$ {thisMonthEarning}</h1>

        </div>

        <div 
      className="shadowAndBorder"
      style={{
          marginTop: "0px",
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px', 
        }}>
          
      <h2 style={{ textAlign: "left" }}>Earnings</h2>
      

        {result.map((item) => 
        <Accordion style={{borderRadius: '5px', background: 'rgba(255,255,255,0.2)'}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <div style={{flex: 1, justifyContent: 'space-between', display: 'flex', fontSize: 'large', fontWeight: 'bold'}}>
            <div>
          {months[item?.month-1]}{" "}{item?.year}
          </div>

          <div>
          $ {calculateMonthlyInvoice(invoices, item?.month, item?.year)}
          </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>


          {provideMonthlyInvoice(invoices, item?.month, item?.year).map((item, index) => 
          <div style={{padding: '10px', borderTop: index !== 0 ? '2px solid #fff' : 'none', fontSize: 'medium'}}>
            <div style={{flex: 1, justifyContent: 'space-between', display: 'flex'}}>
              <div>
            <span style={{fontWeight: 'bold'}}>{item?.subject}</span>
            </div>
            <div>
            $ {item?.sessionInfo?.tutorHourlyRate}
            </div>
            </div>
            <div style={{flex: 1}}>
              
            <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
            <div style={{flex: 1}}>
            {item?.sessionInfo?.date } -- {convertToAMPM(item?.sessionInfo?.time)}</div>
            <div style={{textAlign: 'right', flex: 1}}>
  {
    item?.status === "Pending" ? (
      <>
      <div style={{ color: 'red', fontSize: 'small', fontWeight: 'bold' }}>APPROVAL PENDING</div>
      <Button onClick={() => {
    handleApproveSession(item?.linkId, item?.id)
    }} variant="contained">Approve Session</Button>
      </>
    )
    :
    (
      <div style={{ color: 'green', fontSize: 'small' , fontWeight: 'bold'}}>APPROVED</div>
    )
    }
</div>
 </div>
            <div><FontAwesomeIcon icon={faGraduationCap} /> {item?.studentName}</div>

            </div>
          </div>
          )}
        </AccordionDetails>
      </Accordion>)}

      {result?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#ccc",
              fontSize: "1.5rem",
            }}
          >
            No Earnings Yet
          </div>
        )}
      

        </div>

    </div>
  );
}
