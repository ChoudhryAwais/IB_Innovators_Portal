"use client"

import { useEffect, useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../../../../firebase"
import { toast } from "react-hot-toast"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

export default function StudentDetails({ studentData, studentId, viewType }) {
  const [balanceHistory, setBalanceHistory] = useState([])
  const [balanceMonths, setBalanceMonths] = useState([])
  const [classMonths, setClassMonths] = useState([])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // ---------- Utilities ----------
  function extractMonthYearFromDate(dateValue) {
    const date = new Date(dateValue)
    return { month: date.getMonth() + 1, year: date.getFullYear() }
  }

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = invoice.createdAt.toDate()
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() }
  }

  function getUniqueMonthsAndYearsFromInvoices(invoices) {
    const unique = []
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice)
      if (!unique.some((i) => i.month === month && i.year === year)) {
        unique.push({ month, year })
      }
    })
    unique.sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))
    return unique
  }

  function getUniqueMonthsAndYearsFromClasses(classes) {
    const unique = []
    classes.forEach((cls) => {
      const { month, year } = extractMonthYearFromDate(cls.sessionInfo.date)
      if (!unique.some((i) => i.month === month && i.year === year)) {
        unique.push({ month, year })
      }
    })
    unique.sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))
    return unique
  }

  const filterInvoicesByMonth = (invoices, month, year) =>
    invoices
      .filter((invoice) => {
        const d = invoice.createdAt.toDate()
        return d.getMonth() === month - 1 && d.getFullYear() === year
      })
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())

  const filterClassesByMonth = (classes, month, year) =>
    classes
      .filter((cls) => {
        const d = new Date(cls.sessionInfo.date)
        return d.getMonth() === month - 1 && d.getFullYear() === year
      })
      .sort((a, b) => new Date(b.sessionInfo.date) - new Date(a.sessionInfo.date))

  //orignal function for calculating the invoice
  // const calculateMonthlyInvoice = (invoices, month, year) =>
  //   filterInvoicesByMonth(invoices, month, year).reduce(
  //     (total, inv) => total + Number.parseInt(inv.amount),
  //     0
  //   )

  const calculateMonthlyInvoice = (invoices, month, year) => {
  const total = filterInvoicesByMonth(invoices, month, year).reduce(
    (sum, inv) => {
      const amount = parseFloat(inv.amount) // parse with decimals
      return sum + (isNaN(amount) ? 0 : amount)
    },
    0
  )
  return Math.floor(total) // final integer conversion (truncates decimals)
}


  function formatDisplayDateTime(timestamp) {
    let date
    if (timestamp instanceof Date) {
      date = timestamp
    } else if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate()
    } else {
      return ""
    }
    const options = {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  function formatDate(inputDate) {
    const options = { day: "numeric", month: "short", year: "numeric" }
    return new Date(inputDate).toLocaleDateString("en-GB", options)
  }

  function formatTimeTo12Hour(time24) {
    const [hour, minute] = time24.split(":")
    let hourNum = Number.parseInt(hour, 10)
    const period = hourNum >= 12 ? "PM" : "AM"
    hourNum = hourNum % 12 || 12
    return `${hourNum}:${minute} ${period}`
  }

  // ---------- Fetch ----------
  useEffect(() => {
    async function fetchUserData() {
      try {
        const userDocRef = doc(db, "userList", studentId)
        const userData = await getDoc(userDocRef)
        setBalanceHistory(userData.data()?.balanceHistory || [])
      } catch (e) {
        toast.error("Error fetching balance")
      }
    }
    fetchUserData()
  }, [studentId])

  useEffect(() => {
    if (balanceHistory.length > 0) {
      setBalanceMonths(getUniqueMonthsAndYearsFromInvoices(balanceHistory))
    }
  }, [balanceHistory])

  useEffect(() => {
    if (studentData?.classes?.length > 0) {
      setClassMonths(getUniqueMonthsAndYearsFromClasses(studentData.classes))
    }
  }, [studentData])

  // ---------- Render ----------
  if (viewType === "classes") {
    return (
      <div className="space-y-4">
        {classMonths.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No class record
        </div>
      ) : (
        classMonths.map((item, index) => (
          <Accordion
            key={index}
            className="overflow-hidden"
            sx={{
              "&:before": { display: "none" },
              boxShadow: "none",
              border: "1px solid #A2A1A833",
              borderRadius: "12px !important",
              overflow: "hidden",
              backgroundColor: "#A2A1A80D",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />}
              aria-controls={`panel-class-${index}-content`}
              id={`panel-class-${index}`}
              className="px-6 py-4 hover:bg-gray-50"
              sx={{
                  minHeight: "72px !important", // collapsed height
                  maxHeight: "72px",
                  "&.Mui-expanded": {
                    minHeight: "72px !important",
                    maxHeight: "72px",
                    maxHeight: "72px",
                    "& .summary-text, & .MuiAccordionSummary-expandIconWrapper svg": {
                      color: "#4071B6",
                    },
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    my: 0,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiAccordionSummary-content.Mui-expanded": {
                    margin: 0,
                    my: 0,
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    marginLeft: "16px",
                    color: "#4071B6"
                  },
                }}
            >
              <div className="flex w-full justify-between items-center summary-text">
                <div className="text-lg font-light">
                  {months[item.month - 1]} {item.year} Classes
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
              <Box sx={{ borderTop: "1px solid #e5e7eb", overflow: "hidden" }}>
                {/* Header */}
                <Grid container sx={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 500, color: "#4b5563", p: 1.5 }}>
                  <Grid item xs={4}>Date</Grid>
                  <Grid item xs={4}>Time</Grid>
                  <Grid item xs={4}>Subject</Grid>
                </Grid>
                {/* Rows */}
                {filterClassesByMonth(studentData.classes, item.month, item.year).map((cls, idx) => (
                  <Grid container key={idx} alignItems="center" sx={{ borderBottom: "1px solid #A2A1A81A", p: 1.5 }}>
                    <Grid item xs={4}><div className="text-sm text-gray-600">{formatDate(cls.sessionInfo.date)}</div></Grid>
                    <Grid item xs={4}><div className="text-sm text-gray-600">{formatTimeTo12Hour(cls.sessionInfo.time)}</div></Grid>
                    <Grid item xs={4}><div className="font-medium text-gray-900">{cls.subject}</div></Grid>
                  </Grid>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      </div>
      
    )
  }

  if (viewType === "balance") {
    return (
      <div className="space-y-4">
        {balanceMonths.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No balance record
        </div>
      ) : (
        balanceMonths.map((item, index) => (
          <Accordion
            key={index}
            className="overflow-hidden"
            sx={{
              "&:before": { display: "none" },
              boxShadow: "none",
              border: "1px solid #A2A1A833",
              borderRadius: "12px !important",
              overflow: "hidden",
              backgroundColor: "#A2A1A80D",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />}
              aria-controls={`panel-balance-${index}-content`}
              id={`panel-balance-${index}`}
              className="px-6 py-4 hover:bg-gray-50"
              sx={{
                  minHeight: "72px !important", // collapsed height
                  maxHeight: "72px",
                  "&.Mui-expanded": {
                    minHeight: "72px !important",
                    maxHeight: "72px",
                    maxHeight: "72px",
                    "& .summary-text, & .MuiAccordionSummary-expandIconWrapper svg": {
                      color: "#4071B6",
                    },
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    my: 0,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiAccordionSummary-content.Mui-expanded": {
                    margin: 0,
                    my: 0,
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    marginLeft: "16px",
                    color: "#4071B6"
                  },
                }}
            >
              <div className="flex w-full justify-between items-center summary-text">
                <div className="text-lg font-light">
                  {months[item.month - 1]} {item.year} Balance Details
                </div>
                <div className="text-2xl font-semibold">
                  $ {calculateMonthlyInvoice(balanceHistory, item.month, item.year)}
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
              <Box sx={{ borderTop: "1px solid #e5e7eb", overflow: "hidden" }}>
                {/* Header */}
                <Grid container sx={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 500, color: "#4b5563", p: 1.5 }}>
                  <Grid item xs={4}>Date</Grid>
                  <Grid item xs={4}>Time</Grid>
                  <Grid item xs={4}>Amount</Grid>
                </Grid>
                {/* Rows */}
                {filterInvoicesByMonth(balanceHistory, item.month, item.year).map((inv, idx) => {
                  const dateObj = inv.createdAt.toDate()
                  return (
                    <Grid container key={idx} alignItems="center" sx={{ borderBottom: "1px solid #A2A1A81A", p: 1.5 }}>
                      <Grid item xs={4}><div className="text-sm text-gray-600">{formatDate(dateObj)}</div></Grid>
                      <Grid item xs={4}><div className="text-sm text-gray-600">{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div></Grid>
                      <Grid item xs={4}><div className="font-medium">$ {inv.amount}</div></Grid>
                    </Grid>
                  )
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      </div>
    )
  }

  return null
}
