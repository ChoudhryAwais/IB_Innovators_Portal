"use client"

import { useEffect, useState, useContext } from "react"
import { db } from "../../firebase"
import { doc, getDoc } from "firebase/firestore"
import { MyContext } from "../../Context/MyContext"
import { useNavigate } from "react-router-dom"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import PendingIcon from "@mui/icons-material/Pending"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import { useParams } from "react-router-dom"

import { useTopHeading, TopHeadingProvider } from "../../Components/Layout"

export default function ViewInvoices() {
  const { convertToUSD, exchangeRates } = useContext(MyContext)
  const [finalFilteredInvoices, setFinalFilteredInvoices] = useState([])
  const [showAllInvoices, setShowAllInvoices] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalIBEarnings, setTotalIBEarnings] = useState(0)
  const [thisMonthEarning, setThisMonthEarning] = useState(0)
  const [approvedEarnings, setApprovedEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)

  const { id } = useParams() // subscription id
  const [linkData, setLinkData] = useState(null)
  const [invoices, setInvoices] = useState([])
  const navigate = useNavigate()

  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("View Invoice")
    setSecondMessage("Show all Manage Links / View Invoice")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    if (linkData?.invoices) setInvoices(linkData.invoices)
  }, [linkData])

  useEffect(() => {
    async function fetchLink() {
      const docRef = doc(db, "Linked", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setLinkData(docSnap.data())
        setInvoices(docSnap.data().invoices || [])
      } else {
        console.error("Document not found")
      }
    }
    fetchLink()
  }, [id])

  useEffect(() => {
    const currentMonthInvoice = calculateMonthlyInvoice(invoices, new Date().getMonth() + 1, new Date().getFullYear())
    setTotalEarnings(calculateTotalEarnings(invoices))
    setTotalIBEarnings(calculateTotalIBInnovatorsEarnings(invoices))
    setThisMonthEarning(currentMonthInvoice)
    setApprovedEarnings(calculateApprovedInvoices(invoices, new Date().getMonth() + 1, new Date().getFullYear()))
    setPendingEarnings(calculatePendingInvoices(invoices, new Date().getMonth() + 1, new Date().getFullYear()))
  }, [invoices])

  const [monthlyInvoiceAmount, setMonthlyInvoiceAmount] = useState(0)
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1)
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const dateStr = invoice?.sessionInfo?.date
      if (!dateStr) return false
      const invoiceDate = new Date(dateStr)
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })
    const totalAmount = filteredInvoices.reduce((total, invoice) => {
      const amountStr = invoice?.tutorHourlyRate
      const amount = Number.parseFloat(amountStr) || 0
      return total + amount
    }, 0)
    return totalAmount
  }

  const calculateTotalEarnings = (invoices) => {
    return invoices.reduce((total, invoice) => total + Number.parseInt(invoice?.tutorHourlyRate), 0)
  }

  const calculateTotalIBInnovatorsEarnings = (invoices) => {
    return invoices.reduce((total, invoice) => total + Number.parseInt(invoice?.amount), 0)
  }

  const calculateApprovedInvoices = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date)
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })
    return filteredInvoices.reduce((total, invoice) => {
      if (invoice.status === "Approved") {
        return total + Number.parseInt(invoice?.tutorHourlyRate)
      } else {
        return total
      }
    }, 0)
  }

  const calculatePendingInvoices = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date)
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })
    return filteredInvoices.reduce((total, invoice) => {
      if (invoice.status === "Pending") {
        return total + Number.parseInt(invoice?.tutorHourlyRate)
      } else {
        return total
      }
    }, 0)
  }

  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.sessionInfo.date)
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })
    return filteredInvoices.sort((a, b) => {
      const dateA = a.createdAt.toDate()
      const dateB = b.createdAt.toDate()
      return dateB - dateA
    })
  }

  useEffect(() => {
    const calculatedAmount = calculateMonthlyInvoice(invoices, targetMonth, targetYear)
    setMonthlyInvoiceAmount(calculatedAmount)
  }, [invoices, targetMonth, targetYear])

  const handleMonthChange = (e) => {
    setTargetMonth(Number.parseInt(e.target.value))
    setShowAllInvoices(false)
  }

  const handleYearChange = (e) => {
    setTargetYear(Number.parseInt(e.target.value))
    setShowAllInvoices(false)
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

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = new Date(invoice?.sessionInfo?.date)
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() }
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = []
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice)
      const exists = uniqueMonthsAndYears.some((item) => item.month === month && item.year === year)
      if (!exists) {
        uniqueMonthsAndYears.push({ month, year })
      }
    })
    return uniqueMonthsAndYears
  }

  const result = getUniqueMonthsAndYears(invoices)

  function convertToAMPM(time24) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!regex.test(time24)) {
      console.error("Invalid time format. Please provide HH:mm")
      return null
    }
    const [hours, minutes] = time24.split(":")
    const parsedHours = Number.parseInt(hours, 10)
    const ampm = parsedHours >= 12 ? "PM" : "AM"
    const hours12 = parsedHours % 12 || 12
    return `${hours12}:${minutes} ${ampm}`
  }

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // Derived values for pagination
  const totalRecords = result.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Slice the data for the current page
  const paginatedResults = result.slice(startIndex, endIndex);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <TopHeadingProvider>
      <div className="p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Pending */}
          <div className="bg-[#F493420D] border border-[#F49342] rounded-xl p-6 shadow-sm h-[120px] flex items-center">
            <div className="bg-[#F493420D] p-3 rounded-lg mr-4 flex-shrink-0">
              <PendingIcon className="text-[#F49342] text-3xl" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-[#16151C] font-light">Pending</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#F49342]">
                $ {pendingEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-[#3FC28A0D] border border-[#3FC28A] rounded-xl p-6 shadow-sm h-[120px] flex items-center">
            <div className="bg-[#3FC28A0D] p-3 rounded-lg mr-4 flex-shrink-0">
              <CheckCircleIcon className="text-[#3FC28A] text-3xl" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-[#16151C] font-light">Approved</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#3FC28A]">
                $ {approvedEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-[#00B8E20D] border border-[#00B8E2] rounded-xl p-6 shadow-sm h-[120px] flex items-center">
            <div className="bg-[#00B8E20D] p-3 rounded-lg mr-4 flex-shrink-0">
              <CalendarTodayIcon className="text-[#00B8E2] text-3xl" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-[#16151C] font-light">This Month</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#00B8E2]">
                $ {thisMonthEarning.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#4071B60D] border border-[#4071B6] rounded-xl p-6 shadow-sm h-[120px] flex items-center">
            <div className="bg-[#4071B60D] p-3 rounded-lg mr-4 flex-shrink-0">
              <AccountBalanceWalletIcon className="text-[#4071B6] text-3xl" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-[#16151C] font-light">Total</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#4071B6]">
                $ {totalEarnings.toFixed(2)}
              </div>
            </div>
          </div>

        </div>

        <div className="border border-[#A2A1A833] rounded-[10px] p-6">
          <div className="space-y-4">
            {paginatedResults.map((item, index) => (
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
                  aria-controls={`panel-${index}-content`}
                  id={`panel-${index}`}
                  className="px-6 py-4 hover:bg-gray-50"
                  sx={{
                    minHeight: "72px !important", // collapsed height
                    maxHeight: "72px",            // ensure it doesn’t grow
                    "&.Mui-expanded": {
                      minHeight: "72px !important", // expanded height
                      maxHeight: "72px",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                      my: 0,
                      height: "100%",               // force content to stretch
                      display: "flex",
                      alignItems: "center",         // center items vertically
                    },
                    "&.Mui-expanded": {
                      minHeight: "0px !important",   // 🔒 keep same height
                    },
                    "& .MuiAccordionSummary-content.Mui-expanded": {
                      margin: 0,
                      my: 0,                      // 🔒 prevent extra margin
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      marginLeft: "16px", // lock in consistent spacing
                    },
                  }}
                >
                  <div className="flex w-full justify-between items-center">
                    <div className="text-lg font-light text-[#16151C]">
                      {months[item?.month - 1]} {item?.year} View Details
                    </div>
                    <div className="text-2xl font-semibold text-[#16151C]">
                      $ {calculateMonthlyInvoice(invoices, item?.month, item?.year).toFixed(2)}
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails className="px-0 pb-4 pt-0">
                  <div className="space-y-4">
                    {provideMonthlyInvoice(invoices, item?.month, item?.year).map((invoice, idx) => (
                      <div
                        key={idx}
                        className={`p-4 pb-1 border-top border-gray-200 ${idx !== 0 ? "mt-4" : ""}`}
                      >
                        <div className="flex w-full">
                          {/* Left column: Icon */}
                          <div className="flex-shrink-0">
                            <div className="bg-gray-200 p-2 rounded">
                              <FontAwesomeIcon icon={faGraduationCap} className="text-gray-600 text-lg" />
                            </div>
                          </div>

                          {/* Middle column: expands to fill */}
                          <div className="flex-1 ml-4">
                            <div className="font-semibold text-gray-800 mb-2">{invoice?.subject}</div>

                            <div className="flex flex-col text-sm text-[#16151C] space-y-1">
                              <div className="flex gap-10">
                                <span className="font-light w-28">Tutor Name:</span>
                                <span className="font-medium">{invoice?.teacherName || "N/A"}</span>
                              </div>
                              <div className="flex gap-10">
                                <span className="font-light w-28">Remarks:</span>
                                <span className="font-medium">{invoice?.teacherReview || "N/A"}</span>
                              </div>
                              <div className="flex gap-10">
                                <span className="font-light w-28">Student Remarks:</span>
                                <span className="font-medium">{invoice?.studentReview || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right column: fixed to end */}
                          <div className="flex flex-col justify-between items-end flex-shrink-0 ml-6">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                $ {Number.parseFloat(invoice?.sessionInfo?.tutorHourlyRate || 0).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {invoice?.sessionInfo?.date} ({convertToAMPM(invoice?.sessionInfo?.time)})
                              </div>
                            </div>

                            {invoice?.status === "Pending" ? (
                              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                <PendingIcon className="text-orange-600" style={{ fontSize: "16px" }} />
                                Pending
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                <CheckCircleIcon className="text-green-600" style={{ fontSize: "16px" }} />
                                Approved
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionDetails>



              </Accordion>
            ))}

            {result?.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <div className="text-2xl text-gray-400">No Earnings Yet</div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 py-3 bg-white">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} out of {totalRecords} records
                </div>
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => handlePageChange(page)}
                    color="primary"
                    size="small"
                  />
                </Stack>
              </div>
            )}

          </div>
        </div>


      </div>
    </TopHeadingProvider>
  )
}
