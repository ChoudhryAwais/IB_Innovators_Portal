"use client"

import { useEffect, useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../../../../firebase"
import { toast } from "react-hot-toast"

export default function StudentDetails({ studentData, studentId, viewType }) {
  const [balanceHistory, setBalanceHistory] = useState([])
  const [result, setResult] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewType === "balance" ? 5 : 10

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
    const invoiceDate = invoice.createdAt.toDate()
    const month = invoiceDate.getMonth() + 1
    const year = invoiceDate.getFullYear()
    return { month, year }
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = []
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice)
      const exists = uniqueMonthsAndYears.some((item) => item.month === month && item.year === year)
      if (!exists) uniqueMonthsAndYears.push({ month, year })
    })

    uniqueMonthsAndYears.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      else return b.month - a.month
    })

    return uniqueMonthsAndYears
  }

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate()
      return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
    })

    return filteredInvoices.reduce((total, invoice) => total + Number.parseInt(invoice.amount), 0)
  }

  const provideMonthlyInvoice = (invoices, month, year) => {
    return invoices
      .filter((invoice) => {
        const invoiceDate = invoice.createdAt.toDate()
        return invoiceDate.getMonth() === month - 1 && invoiceDate.getFullYear() === year
      })
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
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
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  function formatDate(inputDate) {
    const options = { day: "numeric", month: "short", year: "numeric" }
    const dateObject = new Date(inputDate)
    const formattedDate = dateObject.toLocaleDateString("en-GB", options)
    const [day, month, year] = formattedDate.split(" ")
    return `${day}\n${month}\n${year}`
  }

  function formatTimeTo12Hour(time24) {
    const [hour, minute] = time24.split(":")
    let hourNum = Number.parseInt(hour, 10)
    const period = hourNum >= 12 ? "PM" : "AM"
    hourNum = hourNum % 12 || 12
    return `${hourNum}:${minute} ${period}`
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userDocRef = doc(db, "userList", studentId)
        const userData = await getDoc(userDocRef)
        setBalanceHistory(userData.data()?.balanceHistory)
      } catch (e) {
        toast.error("Error fetching balance")
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (balanceHistory?.length > 0) {
      setResult(getUniqueMonthsAndYears(balanceHistory || []))
    }
  }, [balanceHistory])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentClasses = studentData.classes.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  if (viewType === "classes") {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Classes Taken - {studentData.studentName}</h2>
        <div className="space-y-3">
          {currentClasses.map((classInfo) => (
            <div className="p-4 bg-white border border-gray-200 rounded-lg" key={classInfo.id}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Subject:</span>
                  <div className="font-medium">{classInfo.subject}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Date:</span>
                  <div className="font-medium">{formatDate(classInfo.sessionInfo.date)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Time:</span>
                  <div className="font-medium">{formatTimeTo12Hour(classInfo.sessionInfo.time)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {studentData.classes.length > itemsPerPage && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(null, Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {Math.ceil(studentData.classes.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  handlePageChange(
                    null,
                    Math.min(Math.ceil(studentData.classes.length / itemsPerPage), currentPage + 1),
                  )
                }
                disabled={currentPage === Math.ceil(studentData.classes.length / itemsPerPage)}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (viewType === "balance") {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Balance History - {studentData.studentName}</h2>
        <div className="space-y-4">
          {result.map((item) => (
            <div key={`${item.month}-${item.year}`} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <span className="font-medium">
                  {months[item?.month - 1]} {item?.year}
                </span>
                <span className="font-bold">£ {calculateMonthlyInvoice(balanceHistory, item?.month, item?.year)}</span>
              </div>
              <div className="p-4 space-y-3">
                {provideMonthlyInvoice(balanceHistory, item?.month, item?.year).map((item, index) => (
                  <div
                    className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-md"
                    key={index}
                  >
                    <span className="font-medium">Amount: £ {item?.amount}</span>
                    <span className="text-sm text-gray-500">{formatDisplayDateTime(item?.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
