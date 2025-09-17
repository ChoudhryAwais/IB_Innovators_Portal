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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments Details</h1>

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
                <div className="flex w-full justify-between items-center summary-text" >
                  <div className="text-lg font-light ">
                    {months[item?.month - 1]} {item?.year} Detail View
                  </div>
                  <div className="text-2xl font-semibold ">
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
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 500,
                      color: "#4b5563",
                      p: 1.5,
                    }}
                  >
                    <Grid item xs={2.6}>
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
                    <Grid item xs={2.4}>
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
                      <Grid item xs={2.6} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#d1d5db", fontSize: 12 }}>
                          {inv?.studentName?.charAt(0) || "S"}
                        </Avatar>
                        <div className="font-medium text-gray-900">{inv?.studentName}</div>
                      </Grid>

                      {/* Subject */}
                      <Grid item xs={2.6}>
                        <div className="text-gray-900">{inv?.subject}</div>
                      </Grid>

                      {/* Date/Time */}
                      <Grid item xs={2.6}>
                        <div className="text-sm text-gray-600">{inv?.sessionInfo?.date}</div>
                        <div className="text-sm text-gray-600">{convertToAMPM(inv?.sessionInfo?.time)}</div>
                      </Grid>

                      {/* Amount */}
                      <Grid item xs={1.7}>
                        <div className="font-bold text-gray-900">$ {inv?.sessionInfo?.tutorHourlyRate}</div>
                      </Grid>

                      {/* Status */}
                      <Grid item xs={2.5}>
                        {inv?.status === "Pending" ? (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#4071B6",
                              "&:hover": { backgroundColor: "#305a91" },
                              textTransform: "none",
                            }}
                            onClick={() => handleApproveSession(inv?.linkId, inv?.id)}
                          >
                            Approve Session
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">Approved</span>
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
