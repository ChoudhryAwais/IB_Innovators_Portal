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
          <div className="bg-[#F493420D] border-1 border-[#F49342] rounded-xl p-6  h-[120px] flex  items-start">
            <div className="bg-[#F493420D] p-[10px] rounded-lg mr-4 flex-shrink-0 -mt-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="27.4987" rx="10" ry="4.16667" stroke="#F49342" stroke-width="3" stroke-linejoin="round" />
                <ellipse cx="20" cy="13.332" rx="5" ry="5" stroke="#F49342" stroke-width="3" stroke-linejoin="round" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.2597 21.8359C8.97122 21.8772 6.84698 22.2646 5.21777 22.9163C4.35919 23.2597 3.56337 23.7061 2.95801 24.2786C2.34963 24.854 1.8341 25.66 1.83398 26.6653C1.83398 27.6708 2.3495 28.4775 2.95801 29.053C3.56338 29.6255 4.35917 30.0718 5.21777 30.4153C6.15621 30.7906 7.2589 31.0783 8.46262 31.2627C7.3921 30.2263 6.75029 29.0325 6.67375 27.7581C6.55567 27.7167 6.4417 27.674 6.33203 27.6301C5.68262 27.3704 5.25754 27.0984 5.01953 26.8733C4.91386 26.7733 4.86669 26.7035 4.8457 26.6653C4.86682 26.627 4.91441 26.5577 5.01953 26.4582C5.25753 26.2332 5.6826 25.9612 6.33203 25.7014C6.59483 25.5963 6.88231 25.498 7.19174 25.408C7.91543 24.0039 9.3491 22.7695 11.2597 21.8359Z" fill="#F49342" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M33.3253 27.7589C33.2485 29.0332 32.6066 30.2269 31.5361 31.2631C32.7409 31.0787 33.8445 30.7909 34.7836 30.4153C35.642 30.0719 36.4371 29.6253 37.0423 29.053C37.6509 28.4775 38.1673 27.6709 38.1673 26.6653C38.1672 25.6599 37.6508 24.854 37.0423 24.2786C36.4371 23.7062 35.642 23.2597 34.7836 22.9163C33.154 22.2644 31.0285 21.877 28.7393 21.8359C30.6496 22.7693 32.0831 24.0034 32.8069 25.4072C33.1174 25.4974 33.4058 25.596 33.6693 25.7014C34.3186 25.9612 34.7438 26.2332 34.9818 26.4583C35.0865 26.5574 35.1335 26.627 35.1547 26.6653C35.1336 26.7036 35.0871 26.7737 34.9818 26.8733C34.7438 27.0984 34.3187 27.3704 33.6693 27.6302C33.5589 27.6743 33.4442 27.7173 33.3253 27.7589Z" fill="#F49342" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.6287 16.6947C27.2157 17.6306 26.6354 18.4762 25.9258 19.1936C26.6345 19.6015 27.4564 19.8349 28.3328 19.835C31.0022 19.835 33.1668 17.6704 33.1668 15.001C33.1666 12.3318 31.0021 10.168 28.3328 10.168C28.1278 10.168 27.9258 10.1808 27.7275 10.2055C28.0993 11.1231 28.3124 12.1219 28.3328 13.168C29.3452 13.168 30.1666 13.9886 30.1668 15.001C30.1668 16.0135 29.3453 16.835 28.3328 16.835C28.0833 16.8349 27.8455 16.785 27.6287 16.6947Z" fill="#F49342" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2729 10.2056C12.0744 10.1808 11.8722 10.168 11.667 10.168C8.99787 10.1681 6.83416 12.3319 6.83398 15.001C6.83398 17.6702 8.99777 19.8348 11.667 19.835C12.5435 19.835 13.3657 19.6016 14.0746 19.1935C13.365 18.4761 12.7847 17.6305 12.3717 16.6946C12.1547 16.785 11.9167 16.835 11.667 16.835C10.6546 16.8348 9.83398 16.0134 9.83398 15.001C9.83416 13.9887 10.6547 13.1681 11.667 13.168C11.6672 13.168 11.6674 13.168 11.6676 13.168C11.688 12.1219 11.9011 11.1231 12.2729 10.2056Z" fill="#F49342" />
              </svg>

            </div>
            <div className="flex flex-col justify-center -mt-1">
              <div className="text-sm text-[#16151C] font-light">Pending</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#F49342]">
                $ {pendingEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-[#3FC28A0D] border-1 border-[#3FC28A] rounded-xl p-6 h-[120px] flex items-start">
            <div className="bg-[#3FC28A0D] p-[10px] rounded-lg mr-4 flex-shrink-0 -mt-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="27.4987" rx="10" ry="4.16667" stroke="#3FC28A" stroke-width="3" stroke-linejoin="round" />
                <ellipse cx="20" cy="13.332" rx="5" ry="5" stroke="#3FC28A" stroke-width="3" stroke-linejoin="round" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.2597 21.8359C8.97122 21.8772 6.84698 22.2646 5.21777 22.9163C4.35919 23.2597 3.56337 23.7061 2.95801 24.2786C2.34963 24.854 1.8341 25.66 1.83398 26.6653C1.83398 27.6708 2.3495 28.4775 2.95801 29.053C3.56338 29.6255 4.35917 30.0718 5.21777 30.4153C6.15621 30.7906 7.2589 31.0783 8.46262 31.2627C7.3921 30.2263 6.75029 29.0325 6.67375 27.7581C6.55567 27.7167 6.4417 27.674 6.33203 27.6301C5.68262 27.3704 5.25754 27.0984 5.01953 26.8733C4.91386 26.7733 4.86669 26.7035 4.8457 26.6653C4.86682 26.627 4.91441 26.5577 5.01953 26.4582C5.25753 26.2332 5.6826 25.9612 6.33203 25.7014C6.59483 25.5963 6.88231 25.498 7.19174 25.408C7.91543 24.0039 9.3491 22.7695 11.2597 21.8359Z" fill="#3FC28A" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M33.3253 27.7589C33.2485 29.0332 32.6066 30.2269 31.5361 31.2631C32.7409 31.0787 33.8445 30.7909 34.7836 30.4153C35.642 30.0719 36.4371 29.6253 37.0423 29.053C37.6509 28.4775 38.1673 27.6709 38.1673 26.6653C38.1672 25.6599 37.6508 24.854 37.0423 24.2786C36.4371 23.7062 35.642 23.2597 34.7836 22.9163C33.154 22.2644 31.0285 21.877 28.7393 21.8359C30.6496 22.7693 32.0831 24.0034 32.8069 25.4072C33.1174 25.4974 33.4058 25.596 33.6693 25.7014C34.3186 25.9612 34.7438 26.2332 34.9818 26.4583C35.0865 26.5574 35.1335 26.627 35.1547 26.6653C35.1336 26.7036 35.0871 26.7737 34.9818 26.8733C34.7438 27.0984 34.3187 27.3704 33.6693 27.6302C33.5589 27.6743 33.4442 27.7173 33.3253 27.7589Z" fill="#3FC28A" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.6287 16.6947C27.2157 17.6306 26.6354 18.4762 25.9258 19.1936C26.6345 19.6015 27.4564 19.8349 28.3328 19.835C31.0022 19.835 33.1668 17.6704 33.1668 15.001C33.1666 12.3318 31.0021 10.168 28.3328 10.168C28.1278 10.168 27.9258 10.1808 27.7275 10.2055C28.0993 11.1231 28.3124 12.1219 28.3328 13.168C29.3452 13.168 30.1666 13.9886 30.1668 15.001C30.1668 16.0135 29.3453 16.835 28.3328 16.835C28.0833 16.8349 27.8455 16.785 27.6287 16.6947Z" fill="#3FC28A" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2729 10.2056C12.0744 10.1808 11.8722 10.168 11.667 10.168C8.99787 10.1681 6.83416 12.3319 6.83398 15.001C6.83398 17.6702 8.99777 19.8348 11.667 19.835C12.5435 19.835 13.3657 19.6016 14.0746 19.1935C13.365 18.4761 12.7847 17.6305 12.3717 16.6946C12.1547 16.785 11.9167 16.835 11.667 16.835C10.6546 16.8348 9.83398 16.0134 9.83398 15.001C9.83416 13.9887 10.6547 13.1681 11.667 13.168C11.6672 13.168 11.6674 13.168 11.6676 13.168C11.688 12.1219 11.9011 11.1231 12.2729 10.2056Z" fill="#3FC28A" />
              </svg>

            </div>
            <div className="flex flex-col justify-center -mt-1">
              <div className="text-sm text-[#16151C] font-light">Approved</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#3FC28A]">
                $ {approvedEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-[#00B8E20D] border-1 border-[#00B8E2] rounded-xl p-6  h-[120px] flex items-start">
            <div className="bg-[#00B8E20D] p-[10px] rounded-lg mr-4 flex-shrink-0 -mt-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="27.4987" rx="10" ry="4.16667" stroke="#00B8E2" stroke-width="3" stroke-linejoin="round" />
                <ellipse cx="20" cy="13.332" rx="5" ry="5" stroke="#00B8E2" stroke-width="3" stroke-linejoin="round" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.2597 21.8359C8.97122 21.8772 6.84698 22.2646 5.21777 22.9163C4.35919 23.2597 3.56337 23.7061 2.95801 24.2786C2.34963 24.854 1.8341 25.66 1.83398 26.6653C1.83398 27.6708 2.3495 28.4775 2.95801 29.053C3.56338 29.6255 4.35917 30.0718 5.21777 30.4153C6.15621 30.7906 7.2589 31.0783 8.46262 31.2627C7.3921 30.2263 6.75029 29.0325 6.67375 27.7581C6.55567 27.7167 6.4417 27.674 6.33203 27.6301C5.68262 27.3704 5.25754 27.0984 5.01953 26.8733C4.91386 26.7733 4.86669 26.7035 4.8457 26.6653C4.86682 26.627 4.91441 26.5577 5.01953 26.4582C5.25753 26.2332 5.6826 25.9612 6.33203 25.7014C6.59483 25.5963 6.88231 25.498 7.19174 25.408C7.91543 24.0039 9.3491 22.7695 11.2597 21.8359Z" fill="#00B8E2" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M33.3253 27.7589C33.2485 29.0332 32.6066 30.2269 31.5361 31.2631C32.7409 31.0787 33.8445 30.7909 34.7836 30.4153C35.642 30.0719 36.4371 29.6253 37.0423 29.053C37.6509 28.4775 38.1673 27.6709 38.1673 26.6653C38.1672 25.6599 37.6508 24.854 37.0423 24.2786C36.4371 23.7062 35.642 23.2597 34.7836 22.9163C33.154 22.2644 31.0285 21.877 28.7393 21.8359C30.6496 22.7693 32.0831 24.0034 32.8069 25.4072C33.1174 25.4974 33.4058 25.596 33.6693 25.7014C34.3186 25.9612 34.7438 26.2332 34.9818 26.4583C35.0865 26.5574 35.1335 26.627 35.1547 26.6653C35.1336 26.7036 35.0871 26.7737 34.9818 26.8733C34.7438 27.0984 34.3187 27.3704 33.6693 27.6302C33.5589 27.6743 33.4442 27.7173 33.3253 27.7589Z" fill="#00B8E2" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.6287 16.6947C27.2157 17.6306 26.6354 18.4762 25.9258 19.1936C26.6345 19.6015 27.4564 19.8349 28.3328 19.835C31.0022 19.835 33.1668 17.6704 33.1668 15.001C33.1666 12.3318 31.0021 10.168 28.3328 10.168C28.1278 10.168 27.9258 10.1808 27.7275 10.2055C28.0993 11.1231 28.3124 12.1219 28.3328 13.168C29.3452 13.168 30.1666 13.9886 30.1668 15.001C30.1668 16.0135 29.3453 16.835 28.3328 16.835C28.0833 16.8349 27.8455 16.785 27.6287 16.6947Z" fill="#00B8E2" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2729 10.2056C12.0744 10.1808 11.8722 10.168 11.667 10.168C8.99787 10.1681 6.83416 12.3319 6.83398 15.001C6.83398 17.6702 8.99777 19.8348 11.667 19.835C12.5435 19.835 13.3657 19.6016 14.0746 19.1935C13.365 18.4761 12.7847 17.6305 12.3717 16.6946C12.1547 16.785 11.9167 16.835 11.667 16.835C10.6546 16.8348 9.83398 16.0134 9.83398 15.001C9.83416 13.9887 10.6547 13.1681 11.667 13.168C11.6672 13.168 11.6674 13.168 11.6676 13.168C11.688 12.1219 11.9011 11.1231 12.2729 10.2056Z" fill="#00B8E2" />
              </svg>

            </div>
            <div className="flex flex-col justify-center -mt-1">
              <div className="text-sm text-[#16151C] font-light">This Month</div>
              <div className="text-sm text-[#16151C] font-light mb-1">Earnings</div>
              <div className="text-2xl font-semibold text-[#00B8E2]">
                $ {thisMonthEarning.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#4071B60D] border-1 border-[#4071B6] rounded-xl p-6  h-[120px] flex items-start">
            <div className="bg-[#4071B60D] p-[10px] rounded-lg mr-4 flex-shrink-0 -mt-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="27.4987" rx="10" ry="4.16667" stroke="#4071B6" stroke-width="3" stroke-linejoin="round" />
                <ellipse cx="20" cy="13.332" rx="5" ry="5" stroke="#4071B6" stroke-width="3" stroke-linejoin="round" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.2597 21.8359C8.97122 21.8772 6.84698 22.2646 5.21777 22.9163C4.35919 23.2597 3.56337 23.7061 2.95801 24.2786C2.34963 24.854 1.8341 25.66 1.83398 26.6653C1.83398 27.6708 2.3495 28.4775 2.95801 29.053C3.56338 29.6255 4.35917 30.0718 5.21777 30.4153C6.15621 30.7906 7.2589 31.0783 8.46262 31.2627C7.3921 30.2263 6.75029 29.0325 6.67375 27.7581C6.55567 27.7167 6.4417 27.674 6.33203 27.6301C5.68262 27.3704 5.25754 27.0984 5.01953 26.8733C4.91386 26.7733 4.86669 26.7035 4.8457 26.6653C4.86682 26.627 4.91441 26.5577 5.01953 26.4582C5.25753 26.2332 5.6826 25.9612 6.33203 25.7014C6.59483 25.5963 6.88231 25.498 7.19174 25.408C7.91543 24.0039 9.3491 22.7695 11.2597 21.8359Z" fill="#4071B6" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M33.3253 27.7589C33.2485 29.0332 32.6066 30.2269 31.5361 31.2631C32.7409 31.0787 33.8445 30.7909 34.7836 30.4153C35.642 30.0719 36.4371 29.6253 37.0423 29.053C37.6509 28.4775 38.1673 27.6709 38.1673 26.6653C38.1672 25.6599 37.6508 24.854 37.0423 24.2786C36.4371 23.7062 35.642 23.2597 34.7836 22.9163C33.154 22.2644 31.0285 21.877 28.7393 21.8359C30.6496 22.7693 32.0831 24.0034 32.8069 25.4072C33.1174 25.4974 33.4058 25.596 33.6693 25.7014C34.3186 25.9612 34.7438 26.2332 34.9818 26.4583C35.0865 26.5574 35.1335 26.627 35.1547 26.6653C35.1336 26.7036 35.0871 26.7737 34.9818 26.8733C34.7438 27.0984 34.3187 27.3704 33.6693 27.6302C33.5589 27.6743 33.4442 27.7173 33.3253 27.7589Z" fill="#4071B6" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.6287 16.6947C27.2157 17.6306 26.6354 18.4762 25.9258 19.1936C26.6345 19.6015 27.4564 19.8349 28.3328 19.835C31.0022 19.835 33.1668 17.6704 33.1668 15.001C33.1666 12.3318 31.0021 10.168 28.3328 10.168C28.1278 10.168 27.9258 10.1808 27.7275 10.2055C28.0993 11.1231 28.3124 12.1219 28.3328 13.168C29.3452 13.168 30.1666 13.9886 30.1668 15.001C30.1668 16.0135 29.3453 16.835 28.3328 16.835C28.0833 16.8349 27.8455 16.785 27.6287 16.6947Z" fill="#4071B6" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2729 10.2056C12.0744 10.1808 11.8722 10.168 11.667 10.168C8.99787 10.1681 6.83416 12.3319 6.83398 15.001C6.83398 17.6702 8.99777 19.8348 11.667 19.835C12.5435 19.835 13.3657 19.6016 14.0746 19.1935C13.365 18.4761 12.7847 17.6305 12.3717 16.6946C12.1547 16.785 11.9167 16.835 11.667 16.835C10.6546 16.8348 9.83398 16.0134 9.83398 15.001C9.83416 13.9887 10.6547 13.1681 11.667 13.168C11.6672 13.168 11.6674 13.168 11.6676 13.168C11.688 12.1219 11.9011 11.1231 12.2729 10.2056Z" fill="#4071B6" />
              </svg>
            </div>
            <div className="flex flex-col justify-center -mt-1">
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
                            <div className="bg-[#A2A1A80D] p-2 rounded">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                                <path d="M6 10H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                                <path d="M6 14H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                                <path d="M6 18H12" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                              </svg>

                            </div>
                          </div>

                          {/* Middle column: expands to fill */}
                          <div className="flex-1 ml-4">
                            <div className="font-semibold text-[16px] text-[#16151C] mb-2">{invoice?.subject}</div>

                            <div className="flex flex-col text-[14px] text-[#16151C] space-y-1">
                              <div className="flex ">
                                <span className="font-light  w-40">Tutor Name:</span>
                                <span className="font-medium">{invoice?.teacherName || "N/A"}</span>
                              </div>
                              <div className="flex ">
                                <span className="font-light w-40">Remarks:</span>
                                <span className="font-medium">{invoice?.teacherReview || "N/A"}</span>
                              </div>
                              <div className="flex ">
                                <span className="font-light w-40">Student Remarks:</span>
                                <span className="font-medium">{invoice?.studentReview || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right column: fixed to end */}
                          <div className="flex flex-col justify-between items-end flex-shrink-0 ml-6">
                            <div className="text-right">
                              <div className={`text-[18px] font-semibold ${invoice?.status === "Pending" ? "text-[#F49342]" : "text-[#3FC28A]"}`}>
                                $ {Number.parseFloat(invoice?.sessionInfo?.tutorHourlyRate || 0).toFixed(2)}
                              </div>
                              <div className="text-[14px] font-light text-[#A2A1A8]">
                                {invoice?.sessionInfo?.date} ({convertToAMPM(invoice?.sessionInfo?.time)})
                              </div>
                            </div>

                            {invoice?.status === "Pending" ? (
                              <div className="flex items-center gap-2  text-[#F49342] py-1 rounded-full text-[14px]  font-semibold mt-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12" stroke="#F49342" stroke-width="1.5" stroke-linecap="round" />
                                  <path d="M12 22C6.47715 22 2 17.5228 2 12" stroke="#F49342" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0.5 3" />
                                  <path d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z" stroke="#F49342" stroke-width="1.5" />
                                  <path d="M12 13.5L12 16M6 12L10.5 12" stroke="#F49342" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                                Pending
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[#3FC28A]  py-1 rounded-full text-[14px] font-semibold mt-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.7687 21.7775 9.58934 21.3704 8.5M7 10L10.5264 12.8211C11.3537 13.483 12.5536 13.3848 13.2624 12.5973L21 4" stroke="#3FC28A" stroke-width="1.5" stroke-linecap="round" />
                                </svg>

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
