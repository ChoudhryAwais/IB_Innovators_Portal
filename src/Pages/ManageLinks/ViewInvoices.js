import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MyContext } from "../../Context/MyContext";
import styles from "./ViewInvoices.module.css";
import { useNavigate } from "react-router-dom";



import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";

export default function ViewInvoices({data, setShowInvoicesModal}) {
  const { convertToUSD, exchangeRates } = useContext(MyContext)
  const [invoices, setInvoices] = useState(data?.invoices ? data?.invoices : []);
  

  const [finalFilteredInvoices, setFinalFilteredInvoices] = useState([]);
  const [showAllInvoices, setShowAllInvoices] = useState(false);




  




  const [totalEarnings, setTotalEarnings] = useState(0);

  const [totalIBEarnings, setTotalIBEarnings] = useState(0);
  
  const [thisMonthEarning, setThisMonthEarning] = useState(0);

  const [approvedEarnings, setApprovedEarnings] = useState(0)

  useEffect(() => {
    const currentMonthInvoice = calculateMonthlyInvoice(
      invoices,
      new Date().getMonth()+1,
      new Date().getFullYear()
    );

    
    setTotalEarnings(calculateTotalEarnings(invoices));
    setTotalIBEarnings(calculateTotalIBInnovatorsEarnings(invoices));
    setThisMonthEarning(currentMonthInvoice);
    setApprovedEarnings(calculateApprovedInvoices(
      invoices,
      new Date().getMonth()+1,
      new Date().getFullYear()
    ))

  }, [invoices]);



  
  const [monthlyInvoiceAmount, setMonthlyInvoiceAmount] = useState(0);
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth()+1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());


  const calculateMonthlyInvoice = (invoices, month, year) => {
  const filteredInvoices = invoices.filter((invoice) => {
    const dateStr = invoice?.sessionInfo?.date;
    if (!dateStr) return false;

    const invoiceDate = new Date(dateStr);
    return (
      invoiceDate.getMonth() === month - 1 &&
      invoiceDate.getFullYear() === year
    );
  });


  const totalAmount = filteredInvoices.reduce((total, invoice) => {
    const amountStr = invoice?.tutorHourlyRate;
    const amount = parseFloat(amountStr) || 0;
    return total + amount;
  }, 0);

  return totalAmount;
};


  // const calculateMonthlyInvoice = (invoices, month, year) => {
  //   const filteredInvoices = invoices.filter((invoice) => {
  //     const invoiceDate = new Date(invoice.sessionInfo.date);
  //     return (
  //       invoiceDate.getMonth() === month - 1 &&
  //       invoiceDate.getFullYear() === year
  //     );
  //   });
    

  //   console.log("filteredInvoices", filteredInvoices)
  //   const totalAmount = filteredInvoices.reduce(
  //     (total, invoice) => total + parseInt(exchangeRates ? convertToUSD(invoice?.tutorHourlyRate) : invoice?.tutorHourlyRate),
  //     0
  //   );


  //   return totalAmount;
  // };

  const calculateTotalEarnings = (invoices) => {
    const totalAmount = invoices.reduce(
      (total, invoice) => total + parseInt(invoice?.tutorHourlyRate),
      0
    );

    return totalAmount;
  }

    const calculateTotalIBInnovatorsEarnings = (invoices) => {
    const totalAmount = invoices.reduce(
      (total, invoice) => total + parseInt(invoice?.amount),
      0
    );

    return totalAmount;
  }

const calculateApprovedInvoices = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.sessionInfo.date);
        return (
            invoiceDate.getMonth() === month - 1 &&
            invoiceDate.getFullYear() === year
        );
    });

    const totalAmount = filteredInvoices.reduce(
        (total, invoice) => {
            if (invoice.status === "Approved") {
                return total + parseInt(invoice?.tutorHourlyRate);
            } else {
                return total;
            }
        },
        0
    );

    return totalAmount
      }


  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.sessionInfo.date);
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
    setTargetMonth(parseInt(e.target.value));
    setShowAllInvoices(false)
  };

  const handleYearChange = (e) => {
    setTargetYear(parseInt(e.target.value));
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



  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = new Date(invoice?.sessionInfo?.date); // Convert Firebase timestamp to JavaScript Date
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
    const parsedHours = parseInt(hours, 10);
    const ampm = parsedHours >= 12 ? 'PM' : 'AM';
    const hours12 = parsedHours % 12 || 12;
  
    return `${hours12}:${minutes} ${ampm}`;
  }
  


  return (
    <div style={{flex: 1, gap: '10px', display: 'flex', flexDirection: 'column'}}>

<div style={{flex: 1,backgroundColor: "rgba(255,255,255,0.5)", borderRadius: '5px',
        padding: "0.5rem",
        marginTop: "0px",
        height: "max-content",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          
      <h2 style={{ textAlign: "left" }}>Total IB Innovators Earnings</h2>
      <h1 style={{ textAlign: "center", fontSize: '3rem' }}>
        $ {totalIBEarnings}
        {/* {exchangeRates ? `$ ${totalEarnings}` : `£ ${totalEarnings}`} */}
        </h1>
        </div>

<div style={{flex: 1,backgroundColor: "rgba(255,255,255,0.5)", borderRadius: '5px',
        padding: "0.5rem",
        marginTop: "0px",
        height: "max-content",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          
      <h2 style={{ textAlign: "left" }}>Total Tutor Earnings</h2>
      <h1 style={{ textAlign: "center", fontSize: '3rem' }}>
        $ {totalEarnings}
        {/* {exchangeRates ? `$ ${totalEarnings}` : `£ ${totalEarnings}`} */}
        </h1>
        </div>

<div style={{display: "flex", flexWrap: 'wrap', gap: '10px', flex: 1}}>
<div style={{flex: 1,backgroundColor: "rgba(255,255,255,0.5)", borderRadius: '5px',
        padding: "0.5rem",
        marginTop: "0px",
        height: "max-content",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          
      <h2 style={{ textAlign: "left" }}>Approved Earnings This Month</h2>
      <h1 style={{ textAlign: "center", fontSize: '3rem' }}>
        $ {approvedEarnings}
        {/* {exchangeRates ? `$ ${approvedEarnings}` : `£ ${approvedEarnings}`} */}
        </h1>
        </div>


      <div style={{flex: 1,backgroundColor: "rgba(255,255,255,0.5)", borderRadius: '5px',
        padding: "0.5rem",
        marginTop: "0px",
        height: "max-content",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          
      <h2 style={{ textAlign: "left" }}>Earnings This Month</h2>
      <h1 style={{ textAlign: "center", fontSize: '3rem' }}>
        $ {thisMonthEarning}
        {/* {exchangeRates ? `$ ${thisMonthEarning}` : `£ ${thisMonthEarning}`} */}
        </h1>
        </div>
        </div>

        <div style={{backgroundColor: "rgba(255,255,255,0.5)", borderRadius: '5px',
        padding: "0.5rem",
        marginTop: "0px",
        height: "max-content",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          
      <h2 style={{ textAlign: "left" }}>Earning History</h2>
      
        {result.map((item, index) => 
        <Accordion key={index} style={{backgroundColor: "rgba(255,255,255,0.5)"}}>
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
            {
              exchangeRates ?
              `$ ${calculateMonthlyInvoice(invoices, item?.month, item?.year)}` :
              `£ ${calculateMonthlyInvoice(invoices, item?.month, item?.year)}`
            }
          </div>
          </div>
        </AccordionSummary>
        <AccordionDetails>


          {provideMonthlyInvoice(invoices, item?.month, item?.year).map((item, index) => 
          <div style={{padding: '10px', borderTop: index !== 0 ? '2px solid #ccc' : 'none', fontSize: 'medium'}}>
            <div style={{flex: 1, justifyContent: 'space-between', display: 'flex'}}>
              <div>
               <span style={{fontWeight: 'bold'}}>{item?.subject}</span>
            </div>
            <div>
              $ {item?.sessionInfo?.tutorHourlyRate}
            {/* {exchangeRates ?  `$ ${convertToUSD(item?.sessionInfo?.tutorHourlyRate)}` : `£ ${item?.sessionInfo?.tutorHourlyRate}`} */}
            </div>
            </div>
            <div style={{flex: 1}}>
              
            <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
            {item?.sessionInfo?.date } -- {convertToAMPM(item?.sessionInfo?.time)}</div>
            
            <div style={{textAlign: 'right'}}>
  {
    item?.status === "Pending" ? (
      <div style={{ color: 'red' }}>PENDING APPROVAL</div>
    ) : (
      <div style={{ color: 'darkgreen' }}>APPROVED</div>
    )}
</div>
 </div>
 
 <div><FontAwesomeIcon icon={faGraduationCap} /> {item?.studentName}</div>
      {item?.teacherReview && <div ><b>Teacher Remarks:</b> {item?.teacherReview}</div>}
      {item?.studentReview && <div ><b>Student Remarks:</b> {item?.studentReview}</div>}
          
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

        <div style={{ marginTop: "10px" }}>
                <Button variant="contained" disableElevation style={{flex: 1, width: '100%'}} onClick={() => setShowInvoicesModal(false)}>
                  Close
                </Button>
              </div>
    </div>
  );
}
