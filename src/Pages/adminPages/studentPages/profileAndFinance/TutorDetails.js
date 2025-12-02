"use client"

import { useEffect, useState } from "react"
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore"
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

export default function TutorDetails({ tutorData, tutorId, viewType }) {
  const [earningsHistory, setEarningsHistory] = useState([])
  const [earningsMonths, setEarningsMonths] = useState([])
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

  const calculateMonthlyEarnings = (invoices, month, year) => {
    const total = filterInvoicesByMonth(invoices, month, year).reduce(
      (sum, inv) => {
        const amount = parseFloat(inv.tutorHourlyRate)
        return sum + (isNaN(amount) ? 0 : amount)
      },
      0
    )
    return Math.floor(total)
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
    async function fetchTutorData() {
      try {
        const tutorDocRef = doc(db, "userList", tutorId)
        const tutorSnap = await getDoc(tutorDocRef)
        setEarningsHistory(tutorSnap.data()?.balanceHistory || [])

        // fetch linked invoices (students linked to this tutor)
        const linkedRef = collection(db, "Linked")
        const q = query(linkedRef, where("teacherId", "==", tutorId))
        const linkedSnap = await getDocs(q)
        

        const invoices = []
        linkedSnap.forEach((doc) => {
            console.log("🔥 RAW FIRESTORE INVOICE DATA:", doc.data().invoices);
          if (doc.data().invoices) {
            invoices.push(...doc.data().invoices)
          }
        })
        setEarningsHistory(invoices)
      } catch (e) {
        toast.error("Error fetching tutor earnings")
      }
    }
    fetchTutorData()
  }, [tutorId])

  useEffect(() => {
    if (earningsHistory.length > 0) {
      setEarningsMonths(getUniqueMonthsAndYearsFromInvoices(earningsHistory))
    }
  }, [earningsHistory])

  useEffect(() => {
    if (tutorData?.classes?.length > 0) {
      setClassMonths(getUniqueMonthsAndYearsFromClasses(tutorData.classes))
    }
  }, [tutorData])

  // ---------- Render ----------
  if (viewType === "classes") {
    return (
      <div className="space-y-4">
        {classMonths.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No teaching record</div>
        ) : (
          classMonths.map((item, index) => (
            <Accordion key={index} className="overflow-hidden"
              sx={{
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "1px solid #A2A1A833",
                borderRadius: "12px !important",
                backgroundColor: "#A2A1A80D",
                overflow: "hidden",

              }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />}
                aria-controls={`panel-class-${index}-content`}
                id={`panel-class-${index}`}
                className="px-6 py-4 hover:bg-gray-50"
                sx={{
                  minHeight: "60px !important", // collapsed height
                  maxHeight: "60px",
                  "&.Mui-expanded": {
                    minHeight: "60px !important",
                    maxHeight: "60px",
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
                    {months[item.month - 1]} {item.year} Classes Taught
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
                <Box sx={{ borderTop: "1px solid #e5e7eb" }}>
                  <Grid container sx={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 300, color: "#A2A1A8", p: 1.5, fontSize: '14px' }}>
                    <Grid item xs={4}>Date</Grid>
                    <Grid item xs={4}>Time</Grid>
                    <Grid item xs={4}>Subject</Grid>
                  </Grid>
                  {filterClassesByMonth(tutorData.classes, item.month, item.year).map((cls, idx) => (
                    <Grid container key={idx} alignItems="center" sx={{ borderBottom: "1px solid #A2A1A81A", p: 1.5 }}>
                      <Grid item xs={4}><div className="text-[14px] font-light text-[#16151C]">{formatDate(cls.sessionInfo.date)}</div></Grid>
                      <Grid item xs={4}><div className="text-[14px] font-light text-[#16151C]">{formatTimeTo12Hour(cls.sessionInfo.time)}</div></Grid>
                      <Grid item xs={4}><div className="text-[14px] font-light text-[#16151C]">{cls.subject}</div></Grid>
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
        {earningsMonths.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No earnings record</div>
        ) : (
          earningsMonths.map((item, index) => (
            <Accordion key={index} className="overflow-hidden"
              sx={{
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "1px solid #A2A1A833",
                borderRadius: "12px !important",
                overflow: "hidden",
                backgroundColor: "#A2A1A80D",
              }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />}
                aria-controls={`panel-balance-${index}-content`}
                id={`panel-balance-${index}`}
                className="px-6 py-4 hover:bg-gray-50"
                sx={{
                  minHeight: "60px !important", // collapsed height
                  maxHeight: "60px",
                  "&.Mui-expanded": {
                    minHeight: "60px !important",
                    maxHeight: "60px",
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
                    {months[item.month - 1]} {item.year} Detail View
                  </div>
                  <div className="text-2xl font-semibold">
                     {calculateMonthlyEarnings(earningsHistory, item.month, item.year)}
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
                <Box sx={{ borderTop: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <Grid container sx={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontWeight: 300, color: "#A2A1A8", p: 1.5,fontSize: '14px' }}>
                    <Grid item xs={4}>Date</Grid>
                    <Grid item xs={6.4}>Time</Grid>
                    <Grid item xs={1.6}>Credits</Grid>
                  </Grid>
                  {filterInvoicesByMonth(earningsHistory, item.month, item.year).map((inv, idx) => {
                    const dateObj = inv.createdAt.toDate()
                    return (
                    <Grid container key={idx} alignItems="center" sx={{ borderBottom: "1px solid #A2A1A81A", p: 1.5 }}>
                        <Grid item xs={4}><div className="text-[14px] font-light text-[#16151C]">{formatDate(dateObj)}</div></Grid>
                        <Grid item xs={5.5}><div className="text-[14px] font-light text-[#16151C]">{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</div></Grid>
                        <Grid item xs={1.7}><div className="text-[14px] font-light text-[#16151C] text-end"> {inv.tutorHourlyRate
}</div></Grid>
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
