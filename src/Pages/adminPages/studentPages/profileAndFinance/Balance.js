"use client"

import React, { useState, useEffect, useContext } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Accordion, AccordionSummary, AccordionDetails, Avatar, Button, Box, Grid } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { toast } from "react-hot-toast"
import emailjs from "emailjs-com"
import { MyContext } from "../../../../Context/MyContext"

export default function Balance({ userDetails, userId }) {
  const { calculateHoursLeft, convertToGBP } = useContext(MyContext)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked")
        const q = query(linkedRef, where("studentId", "==", userId))

        try {
          setLoading(true)
          const querySnapshot = await getDocs(q)
          const updatedStudents = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            if (!data.studentDeactivated) {
              updatedStudents.push({ ...data })
            }
          })

          setStudents(updatedStudents)
        } catch (error) {
          console.error("Error fetching data: ", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [userId])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = invoice.createdAt.toDate()
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() }
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = []
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice)
      const exists = uniqueMonthsAndYears.some((i) => i.month === month && i.year === year)
      if (!exists) uniqueMonthsAndYears.push({ month, year })
    })
    return uniqueMonthsAndYears.sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))
  }

  const calculateMonthlyInvoice = (invoices, month, year) => {
    return invoices
      .filter((invoice) => {
        const d = invoice.createdAt.toDate()
        return d.getMonth() === month - 1 && d.getFullYear() === year
      })
      .reduce((total, invoice) => total + parseInt(invoice.amount), 0)
  }

  const provideMonthlyInvoice = (invoices, month, year) => {
    return invoices
      .filter((invoice) => {
        const d = invoice.createdAt.toDate()
        return d.getMonth() === month - 1 && d.getFullYear() === year
      })
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
  }

  const result = getUniqueMonthsAndYears(userDetails?.balanceHistory || [])

  function formatDisplayDateTime(timestamp) {
    if (!timestamp) return ""
    const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : timestamp
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: true,
    }).format(date)
  }

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }))
  }

  return (
    <div className="">
      {/* Credits Left */}
      {/* <h2 style={{ textAlign: "left" }}>
          Credits Left{" "}
          <span style={{ fontSize: "large" }}>
            (worth £ {userDetails?.credits?.toFixed(2)})
          </span>
        </h2> */}
      <h1 className="text-left text-[24px] font-semibold mb-6">Credits Details</h1>
      <div className="space-y-4">
        {result.map((item) => {
          const monthKey = `${item.month}-${item.year}`
          const monthlyInvoices = provideMonthlyInvoice(
            userDetails?.balanceHistory || [],
            item?.month,
            item?.year
          )

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
                expandIcon={
                  <ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />
                }
                aria-controls={`panel-${monthKey}-content`}
                id={`panel-${monthKey}`}
                className="px-6 py-4 hover:bg-gray-50"
                sx={{
                  minHeight: "60px !important",
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
                    color: "#4071B6",
                  },
                }}
              >
                <div className="flex w-full justify-between items-center summary-text">
                  <div className="text-lg font-light">
                    {months[item?.month - 1]} {item?.year} Detail View
                  </div>
                  <div className="text-2xl font-semibold">
                    $ {calculateMonthlyInvoice(userDetails?.balanceHistory || [], item?.month, item?.year)}
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
                      fontWeight: 300,
                      color: "#A2A1A8",
                      p: 1.5,
                      fontSize: '14px'
                    }}
                  >
                    <Grid item xs={4}>
                      Date
                    </Grid>
                    <Grid item xs={6.2}>
                      Time
                    </Grid>
                    <Grid item xs={1.8}>
                      Amount
                    </Grid>
                  </Grid>

                  {/* Data Rows */}
                  {monthlyInvoices.map((inv, idx) => {
                    const dateObj = inv?.createdAt?.toDate?.() || new Date(inv?.createdAt)
                    const date = new Intl.DateTimeFormat("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }).format(dateObj)
                    const time = new Intl.DateTimeFormat("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    }).format(dateObj)

                    return (
                      <Grid
                        container
                        key={idx}
                        alignItems="center"
                        sx={{
                          borderBottom: "1px solid #A2A1A81A",
                          p: 1.5,
                        }}
                      >
                        <Grid item xs={4}>
                          <div className="text-[14px] font-light text-[#16151C]">{date}</div>
                        </Grid>
                        <Grid item xs={5.5}>
                          <div className="text-[14px] font-light text-[#16151C]">{time}</div>
                        </Grid>
                        <Grid item xs={1.7}>
                          <div className="text-[14px] font-light text-[#16151C] text-end">$ {inv?.amount}</div>
                        </Grid>
                      </Grid>
                    )
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          )
        })}

        {result.length === 0 && (
          <div className="text-center text-gray-400 text-xl py-8">No Credit History Yet</div>
        )}
      </div>
    </div>
  )
}
