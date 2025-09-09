import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";

export default function ViewInvoices({ data, setShowInvoicesModal }) {
  const { convertToUSD, exchangeRates } = useContext(MyContext);
  const [invoices, setInvoices] = useState(data?.invoices ? data?.invoices : []);
  const [finalFilteredInvoices, setFinalFilteredInvoices] = useState([]);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalIBEarnings, setTotalIBEarnings] = useState(0);
  const [thisMonthEarning, setThisMonthEarning] = useState(0);
  const [approvedEarnings, setApprovedEarnings] = useState(0);

  useEffect(() => {
    const currentMonthInvoice = calculateMonthlyInvoice(
      invoices,
      new Date().getMonth() + 1,
      new Date().getFullYear()
    );
    setTotalEarnings(calculateTotalEarnings(invoices));
    setTotalIBEarnings(calculateTotalIBInnovatorsEarnings(invoices));
    setThisMonthEarning(currentMonthInvoice);
    setApprovedEarnings(
      calculateApprovedInvoices(invoices, new Date().getMonth() + 1, new Date().getFullYear())
    );
  }, [invoices]);

  const [monthlyInvoiceAmount, setMonthlyInvoiceAmount] = useState(0);
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const dateStr = invoice?.sessionInfo?.date;
      if (!dateStr) return false;
      const invoiceDate = new Date(dateStr);
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year;
    });
    const totalAmount = filteredInvoices.reduce((total, invoice) => {
      const amountStr = invoice?.tutorHourlyRate;
      const amount = parseFloat(amountStr) || 0;
      return total + amount;
    }, 0);
    return totalAmount;
  };

  const calculateTotalEarnings = (invoices) => {
    return invoices.reduce((total, invoice) => total + parseInt(invoice?.tutorHourlyRate), 0);
  };

  const calculateTotalIBInnovatorsEarnings = (invoices) => {
    return invoices.reduce((total, invoice) => total + parseInt(invoice?.amount), 0);
  };

  const calculateApprovedInvoices = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date);
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year;
    });
    return filteredInvoices.reduce((total, invoice) => {
      if (invoice.status === "Approved") {
        return total + parseInt(invoice?.tutorHourlyRate);
      } else {
        return total;
      }
    }, 0);
  };

  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date);
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year;
    });
    return filteredInvoices.sort((a, b) => {
      const dateA = a.createdAt.toDate();
      const dateB = b.createdAt.toDate();
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const calculatedAmount = calculateMonthlyInvoice(invoices, targetMonth, targetYear);
    setMonthlyInvoiceAmount(calculatedAmount);
  }, [invoices, targetMonth, targetYear]);

  const handleMonthChange = (e) => {
    setTargetMonth(parseInt(e.target.value));
    setShowAllInvoices(false);
  };

  const handleYearChange = (e) => {
    setTargetYear(parseInt(e.target.value));
    setShowAllInvoices(false);
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
    const invoiceDate = new Date(invoice?.sessionInfo?.date);
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() };
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = [];
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice);
      const exists = uniqueMonthsAndYears.some((item) => item.month === month && item.year === year);
      if (!exists) {
        uniqueMonthsAndYears.push({ month, year });
      }
    });
    return uniqueMonthsAndYears;
  }

  const result = getUniqueMonthsAndYears(invoices);

  function convertToAMPM(time24) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time24)) {
      console.error("Invalid time format. Please provide HH:mm");
      return null;
    }
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const ampm = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 text-sm font-medium">Total IB Innovators Earnings</h2>
          <h1 className="text-2xl font-bold text-gray-800">${totalIBEarnings}</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 text-sm font-medium">Total Tutor Earnings</h2>
          <h1 className="text-2xl font-bold text-gray-800">${totalEarnings}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 text-sm font-medium">Approved Earnings This Month</h2>
          <h1 className="text-2xl font-bold text-gray-800">${approvedEarnings}</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-600 text-sm font-medium">Earnings This Month</h2>
          <h1 className="text-2xl font-bold text-gray-800">${thisMonthEarning}</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Earning History</h2>
        {result.map((item, index) => (
          <Accordion key={index} className="bg-white/50">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}`}
            >
              <div className="flex w-full justify-between text-lg font-semibold">
                <div>
                  {months[item?.month - 1]} {item?.year}
                </div>
                <div>
                  {exchangeRates
                    ? `$ ${calculateMonthlyInvoice(invoices, item?.month, item?.year)}`
                    : `£ ${calculateMonthlyInvoice(invoices, item?.month, item?.year)}`}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {provideMonthlyInvoice(invoices, item?.month, item?.year).map((invoice, idx) => (
                <div
                  key={idx}
                  className={`p-2 text-base ${idx !== 0 ? "border-t-2 border-gray-300" : ""}`}
                >
                  <div className="flex justify-between">
                    <span className="font-bold">{invoice?.subject}</span>
                    <span>${invoice?.sessionInfo?.tutorHourlyRate}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span>
                        {invoice?.sessionInfo?.date} -- {convertToAMPM(invoice?.sessionInfo?.time)}
                      </span>
                      <span
                        className={`${
                          invoice?.status === "Pending" ? "text-red-600" : "text-green-700"
                        } font-medium`}
                      >
                        {invoice?.status === "Pending" ? "PENDING APPROVAL" : "APPROVED"}
                      </span>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faGraduationCap} /> {invoice?.studentName}
                    </div>
                    {invoice?.teacherReview && (
                      <div>
                        <b>Teacher Remarks:</b> {invoice?.teacherReview}
                      </div>
                    )}
                    {invoice?.studentReview && (
                      <div>
                        <b>Student Remarks:</b> {invoice?.studentReview}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
        {result?.length === 0 && (
          <div className="flex-1 text-center text-2xl text-gray-400">No Earnings Yet</div>
        )}
      </div>

      <Button variant="contained" className="w-full bg-blue-600" onClick={() => setShowInvoicesModal(false)}>
        Close
      </Button>
    </div>
  );
}
