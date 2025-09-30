"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import ViewApplicants from "./ViewApplicants"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import Ellipse from "../../../assets/icons/Ellipse 1171.png"


export function ApplicationsList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [expandedAccordions, setExpandedAccordions] = useState({})
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showTutorModal, setShowTutorModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (location.state?.orders) {
      setOrders(location.state.orders)

      // Expand clicked order
      if (location.state.expandedOrderId) {
        setExpandedAccordions({
          [location.state.expandedOrderId]: true,
        })
      }

      // Also set selectedOrder directly (optional, but helps for modal context)
      const selected = location.state.orders.find(
        (order) => order.id === location.state.expandedOrderId
      )
      setSelectedOrder(selected)

      // Set page from OrderList
      if (location.state.currentPage) {
        setCurrentPage(location.state.currentPage)
      }
    }
  }, [location.state])

  const toggleAccordion = (orderId) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const handleTutorDetails = (tutor, order) => {
    setSelectedTutor(tutor)
    setSelectedOrder(order)
    setShowTutorModal(true)
  }

  const handleCloseModal = () => {
    setShowTutorModal(false)
    setSelectedTutor(null)
    setSelectedOrder(null)
  }

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedOrders = orders.slice(startIndex, endIndex)
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const handleChangePage = (event, newPage) => setCurrentPage(newPage)

  return (
    <div className=" p-6">
      <div className="border-1 rounded-lg p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Applicants Lists</h1>
        </div>

        {/* Orders Accordion */}
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <Accordion
              key={order.id}
              expanded={expandedAccordions[order.id] || false}
              onChange={() => toggleAccordion(order.id)}
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
              {/* Accordion Summary */}
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    fontSize="inherit"
                    className="ml-1 !text-3xl text-[#16151C]"
                  />
                }
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
                <div className="flex w-full items-center justify-between">
                  {/* Left - Student avatar + info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-[40px] h-[40px] flex items-center justify-center rounded-lg bg-[#A2A1A80D] text-gray-500">
                      <div className="bg-[#A2A1A80D] p-2 rounded">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 6H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                          <path d="M6 10H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                          <path d="M6 14H18" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                          <path d="M6 18H12" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#16151C]">
                        {order.subject}
                      </h3>
                      <p className="text-[16px] font-light text-[#16151C]">{order.studentName}</p>
                    </div>
                  </div>

                  {/* Right - View Tutors info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-[18px] font-light text-[#16151C]">
                        View Tutors
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionSummary>

              {/* Accordion Details */}
              <AccordionDetails className="px-0 pb-0 pt-0">
                {/* Tutor Applicants */}

                {order.applicants && order.applicants.length > 0 ? (
                  <div>
                    {order.applicants.map((applicant, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 border-t border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Avatar + Tutor Info */}
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              {applicant.tutorDetails?.profilePicture ? (
                                <img
                                  src={applicant.tutorDetails.profilePicture}
                                  alt={applicant.tutorDetails?.userName || "Tutor"}
                                  className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                                  <FontAwesomeIcon icon={faUser} className="text-xl" />
                                </div>
                              )}
                            </div>
                            <h5 className="font-light text-[18px] text-[#16151C]">
                              {applicant.tutorDetails?.userName}
                            </h5>
                          </div>

                          {/* Right: Details button */}
                          <Button
                            onClick={() => handleTutorDetails(applicant, order)}
                            variant="outlined"
                            size="small"
                            sx={{
                              width: "140px",
                              height: "40px",
                              ml: 2,
                              textTransform: "none",
                              borderRadius: "8px",
                              backgroundColor: "#FFFFFF",
                              borderColor: "#4071B6",
                              color: "#4071B6",
                              fontSize: "16px",
                              fontWeight: 600,
                            }}
                          >
                            <span className="flex items-center gap-3">
                              Details
                              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12.5" cy="12" r="10" stroke="#4071B6" stroke-width="1.5" />
                                <path d="M9.5 16L11.6 13.2C12.1333 12.4889 12.1333 11.5111 11.6 10.8L9.5 8" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M14.5 16L16.6 13.2C17.1333 12.4889 17.1333 11.5111 16.6 10.8L14.5 8" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 border-t border-gray-200">
                    <p>No applicants yet for this course</p>
                  </div>
                )}


              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        {orders.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} out of {orders.length} records
            </div>
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handleChangePage}
                color="primary"
                size="small"
              />
            </Stack>
          </div>
        )}

      </div>

      <ViewApplicants tutor={selectedTutor} order={selectedOrder} open={showTutorModal} onClose={handleCloseModal} />
    </div>
  )
}
