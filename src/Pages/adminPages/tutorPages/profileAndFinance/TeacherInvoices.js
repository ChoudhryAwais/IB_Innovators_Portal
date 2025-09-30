"use client"

import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Avatar,
  Button,
  Box,
  Grid,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

export default function TeacherInvoices({ userDetails, userId }) {
  const [invoices, setInvoices] = useState([])
  const [expandedMonths, setExpandedMonths] = useState({})

  useEffect(() => {
    if (userId) {
      const linkedRef = collection(db, "Linked")
      const q = query(linkedRef, where("teacherId", "==", userId))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const paidInvoices = []
        snapshot.forEach((doc) => {
          const data = doc.data()
            ; (data.invoices || []).forEach((invoice) => {
              paidInvoices.push({ ...invoice, linkId: doc.id })
            })
        })
        setInvoices(paidInvoices)
      })
      return () => unsubscribe()
    }
  }, [userId])

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date)
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })

    return filteredInvoices.reduce((total, invoice) => total + Number.parseFloat(invoice?.tutorHourlyRate), 0)
  }

  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate()
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })

    return filteredInvoices.sort((a, b) => {
      const dateA = a.createdAt.toDate()
      const dateB = b.createdAt.toDate()
      return dateB - dateA
    })
  }

  async function handleApproveSession(linkId, invoiceId) {
    try {
      const linkedRef = doc(db, "Linked", linkId)
      const linkedDocSnap = await getDoc(linkedRef)

      if (linkedDocSnap.exists()) {
        const invoices = linkedDocSnap.data().invoices || []
        const index = invoices.findIndex((invoice) => invoice.id === invoiceId)

        if (index !== -1) {
          invoices[index].status = "Approved"
          invoices[index].studentReview = "Admin Reviewed"
          invoices[index].rating = 5

          await updateDoc(linkedRef, { invoices })
          toast.success("Session Approved")
        } else {
          toast.error("Session not found")
        }
      } else {
        toast.error("Subscription not found")
      }
    } catch {
      toast.error("Error approving session")
    }
  }

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = invoice.createdAt.toDate()
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() }
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = []

    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice)
      const exists = uniqueMonthsAndYears.some((item) => item.month === month && item.year === year)
      if (!exists) uniqueMonthsAndYears.push({ month, year })
    })

    return uniqueMonthsAndYears.sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))
  }

  const result = getUniqueMonthsAndYears(invoices)

  function convertToAMPM(time24) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!regex.test(time24)) return null

    const [hours, minutes] = time24.split(":")
    const parsedHours = Number.parseInt(hours, 10)
    const ampm = parsedHours >= 12 ? "PM" : "AM"
    const hours12 = parsedHours % 12 || 12

    return `${hours12}:${minutes} ${ampm}`
  }

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
  ]

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }))
  }

  return (
    <div className="">
      <h1 className="text-2xl font-semibold text-[#16151C] mb-6">Payments Details</h1>

      <div className="space-y-4">
        {result.map((item) => {
          const monthKey = `${item.month}-${item.year}`
          const isExpanded = expandedMonths[monthKey]
          const monthlyInvoices = provideMonthlyInvoice(invoices, item?.month, item?.year)

          return (
            <Accordion
              key={monthKey}
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
                aria-controls={`panel-${monthKey}-content`}
                id={`panel-${monthKey}`}
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
                <div className="flex w-full justify-between items-center summary-text" >
                  <div className="text-[18px] font-semibold">
                    {months[item?.month - 1]} {item?.year} Detail View
                  </div>
                  <div className="text-[24px] font-semibold ">
                    $ {calculateMonthlyInvoice(invoices, item?.month, item?.year)}
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
                <Box sx={{ borderTop: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {/* Header Row */}
                  <Grid
                    container
                    sx={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #A2A1A833",
                      fontWeight: 300,
                      color: "#A2A1A8",
                      p: 1.5,
                    }}
                  >
                    <Grid item xs={2.7}>
                      Student Name
                    </Grid>
                    <Grid item xs={2.6}>
                      Subject
                    </Grid>
                    <Grid item xs={2.5}>
                      Date/Time
                    </Grid>
                    <Grid item xs={1.9}>
                      Amount
                    </Grid>
                    <Grid item xs={2.3}>
                      Session Status
                    </Grid>
                  </Grid>

                  {/* Data Rows */}
                  {monthlyInvoices.map((inv) => (
                    <Grid
                      container
                      key={inv.id}
                      alignItems="center"
                      sx={{
                        borderBottom: "1px solid #A2A1A81A",
                        p: 1.5,
                        // "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      {/* Student */}
                      <Grid item xs={2.7} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#d1d5db", fontSize: 12 }}>
                          {inv?.studentName?.charAt(0) || "S"}
                        </Avatar>
                        <div className="font-light text-[12px] text-[#16151C]">{inv?.studentName}</div>
                      </Grid>

                      {/* Subject */}
                      <Grid item xs={2.7}>
                        <div className="font-light text-[12px] text-[#16151C]">{inv?.subject}</div>
                      </Grid>

                      {/* Date/Time */}
                      <Grid item xs={2.6}>
                        <div className="font-light text-[12px] text-[#16151C]">{inv?.sessionInfo?.date}</div>
                        <div className="font-light text-[12px] text-[#16151C]">{convertToAMPM(inv?.sessionInfo?.time)}</div>
                      </Grid>

                      {/* Amount */}
                      <Grid item xs={1.7}>
                        <div className="font-light text-[18px] text-[#16151C]">$ {inv?.sessionInfo?.tutorHourlyRate}</div>
                      </Grid>

                      {/* Status */}
                      <Grid item xs={2.3}>
                        {inv?.status === "Pending" ? (
                          <Button
                            variant="contained"
                            
                            sx={{
                              backgroundColor: "#4071B6",
                              width: "116px",
                              height: "40px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              padding: 0,
                              "&:hover": { backgroundColor: "#305a91" },
                              textTransform: "none",
                            }}
                            onClick={() => handleApproveSession(inv?.linkId, inv?.id)}
                          >
                            Approve Session
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 ">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.7687 21.7775 9.58934 21.3704 8.5M7 10L10.5264 12.8211C11.3537 13.483 12.5536 13.3848 13.2624 12.5973L21 4" stroke="#3FC28A" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                            <span className="text-[14px] text-[#3FC28A] font-semibold ">Approved</span>
                          </div>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )
        })}

        {result.length === 0 && <div className="text-center text-gray-400 text-xl py-8">No Payments Yet</div>}
      </div>
    </div>
  )
}
