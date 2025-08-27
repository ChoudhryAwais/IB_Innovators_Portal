import React, { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { toast } from "react-hot-toast";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination"; // Import Pagination

export default function StudentDetails({ studentData, studentId }) {
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // State to manage current page
  const itemsPerPage = 5; // Number of classes per page

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
      const exists = uniqueMonthsAndYears.some(
        (item) => item.month === month && item.year === year
      );
      if (!exists) uniqueMonthsAndYears.push({ month, year });
    });

    uniqueMonthsAndYears.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      else return b.month - a.month;
    });

    return uniqueMonthsAndYears;
  }

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate();
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });

    const totalAmount = filteredInvoices.reduce(
      (total, invoice) => total + parseInt(invoice.amount),
      0
    );

    return totalAmount;
  };

  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate();
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });

    return filteredInvoices.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  };

  function formatDisplayDateTime(timestamp) {
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else {
      return "";
    }

    const options = {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  function formatDate(inputDate) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateObject = new Date(inputDate);
    const formattedDate = dateObject.toLocaleDateString('en-GB', options);
    const [day, month, year] = formattedDate.split(' ');

    return `${day}\n${month}\n${year}`;
  }

  function formatTimeTo12Hour(time24) {
    const [hour, minute] = time24.split(':');
    let hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12 || 12;
    return `${hourNum}:${minute} ${period}`;
  }

  useEffect(() => {
    async function fetchUserData() {
        try{
      const userDocRef = doc(db, "userList", studentId);
      const userData = await getDoc(userDocRef);
      setBalanceHistory(userData.data()?.balanceHistory);
    } catch(e){
        toast.error("Error fetching balance")
    }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    if(balanceHistory?.length > 0){
    setResult(getUniqueMonthsAndYears(balanceHistory || []));
    }
  }, [balanceHistory]);

  // Calculate the classes to display based on current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = studentData.classes.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      <div style={{background: '#eee', padding: '1rem', borderRadius: '10px'}}>
        <h5 style={{fontWeight: 'bolder', flex: 1, textAlign: 'center'}}> Balance History </h5>
        {result.map((item) => (
          <Accordion
            style={{ borderRadius: "5px", background: "rgba(255,255,255,0.2)" }}
            key={`${item.month}-${item.year}`}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <div
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  display: "flex",
                  fontSize: "large",
                  fontWeight: "bold",
                }}
              >
                <div>
                  {months[item?.month - 1]} {item?.year}
                </div>

                <div>
                  £{" "}
                  {calculateMonthlyInvoice(
                    balanceHistory,
                    item?.month,
                    item?.year
                  )}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {provideMonthlyInvoice(
                balanceHistory,
                item?.month,
                item?.year
              ).map((item, index) => (
                <div
                  style={{
                    padding: "10px",
                    borderTop: index !== 0 ? "2px solid #ccc" : "none",
                    fontSize: "medium",
                  }}
                  key={index}
                >
                  <div
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                      display: "flex",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      Amount: £ {item?.amount}
                    </span>
                    <span>{formatDisplayDateTime(item?.createdAt)}</span>
                  </div>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <div style={{background: '#eee', padding: '1rem', borderRadius: '10px', marginTop: '1rem'}}>
        <h5 style={{fontWeight: 'bolder', flex: 1, textAlign: 'center'}}> Classes Taken </h5>
        <div>
          {currentClasses.map((classInfo) => (
            <div style={{padding: '10px', borderRadius: '10px', background: '#fff', marginTop: '5px'}} key={classInfo.id}>
              Subject: {classInfo.subject}<br/>
              Date: {formatDate(classInfo.sessionInfo.date)}<br/>
              Time: {formatTimeTo12Hour(classInfo.sessionInfo.time)}
            </div>
          ))}
        </div>
        <Pagination
          count={Math.ceil(studentData.classes.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}
        />
      </div>
    </div>
  );
}
