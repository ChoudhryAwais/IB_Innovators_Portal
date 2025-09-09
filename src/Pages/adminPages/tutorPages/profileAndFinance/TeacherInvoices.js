"use client"

import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"

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
          ;(data.invoices || []).forEach((invoice) => {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments Details</h1>

      <div className="space-y-4">
        {result.map((item) => {
          const monthKey = `${item.month}-${item.year}`
          const isExpanded = expandedMonths[monthKey]
          const monthlyInvoices = provideMonthlyInvoice(invoices, item?.month, item?.year)

          return (
            <div key={monthKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleMonth(monthKey)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-medium text-gray-900">
                  {months[item?.month - 1]} {item?.year} Detail View
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    $ {calculateMonthlyInvoice(invoices, item?.month, item?.year)}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                        <div>Student Name</div>
                        <div>Subject</div>
                        <div>Date/Time</div>
                        <div>Amount</div>
                        <div>Session Status</div>
                      </div>

                      {monthlyInvoices.map((inv, idx) => (
                        <div
                          key={inv.id}
                          className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100 last:border-b-0 items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {inv?.studentName?.charAt(0) || "S"}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{inv?.studentName}</span>
                          </div>

                          <div className="text-gray-900">{inv?.subject}</div>

                          <div className="text-gray-600 text-sm">
                            <div>{inv?.sessionInfo?.date}</div>
                            <div>{convertToAMPM(inv?.sessionInfo?.time)}</div>
                          </div>

                          <div className="font-bold text-gray-900">$ {inv?.sessionInfo?.tutorHourlyRate}</div>

                          <div>
                            {inv?.status === "Pending" ? (
                              <button
                                onClick={() => handleApproveSession(inv?.linkId, inv?.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Approve Session
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm font-medium">Approved</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {result.length === 0 && <div className="text-center text-gray-400 text-xl py-8">No Payments Yet</div>}
      </div>
    </div>
  )
}
