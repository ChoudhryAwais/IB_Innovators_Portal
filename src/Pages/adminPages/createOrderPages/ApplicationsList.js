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
    <div className="p-4 sm:p-6">
      <div className="border-1 rounded-lg p-3 sm:p-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Applicants Lists</h1>
        </div>

        {/* Orders Accordion */}
        <div className="space-y-3 sm:space-y-4">
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
                    className="ml-1 !text-2xl sm:!text-3xl text-[#16151C]"
                  />
                }
                className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50"
                sx={{
                  minHeight: "60px !important", // smaller on mobile
                  maxHeight: "60px",            
                  "&.Mui-expanded": {
                    minHeight: "60px !important", 
                    maxHeight: "60px",
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    my: 0,
                    height: "100%",               
                    display: "flex",
                    alignItems: "center",         
                  },
                  "&.Mui-expanded": {
                    minHeight: "60px !important",   
                  },
                  "& .MuiAccordionSummary-content.Mui-expanded": {
                    margin: 0,
                    my: 0,                      
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    marginLeft: "12px",
                    sm: { marginLeft: "16px" },
                  },
                }}
              >
                <div className="flex w-full items-center justify-between">
                  {/* Left - Student avatar + info */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-[40px] sm:h-[40px] flex items-center justify-center rounded-lg bg-[#A2A1A80D] text-gray-500">
                      <div className="bg-[#A2A1A80D] p-1 sm:p-2 rounded">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 6H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M6 10H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M6 14H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M6 18H12" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#16151C] truncate">
                        {order.subject}
                      </h3>
                      <p className="text-[12px] sm:text-[16px] font-light text-[#16151C] truncate">{order.studentName}</p>
                    </div>
                  </div>

                  {/* Right - View Tutors info */}
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] sm:text-[18px] font-light text-[#16151C] hidden sm:block">
                        View Tutors
                      </p>
                      <p className="text-[12px] sm:text-[18px] font-light text-[#16151C] block sm:hidden">
                        Tutors
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                          {/* Left: Avatar + Tutor Info */}
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {applicant.tutorDetails?.profilePicture ? (
                                <img
                                  src={applicant.tutorDetails.profilePicture}
                                  alt={applicant.tutorDetails?.userName || "Tutor"}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-gray-200 text-gray-500">
                                  <FontAwesomeIcon icon={faUser} className="text-lg sm:text-xl" />
                                </div>
                              )}
                            </div>
                            <h5 className="font-light text-[16px] sm:text-[18px] text-[#16151C] truncate min-w-0">
                              {applicant.tutorDetails?.userName}
                            </h5>
                          </div>

                          {/* Right: Details button */}
                          <Button
                            onClick={() => handleTutorDetails(applicant, order)}
                            variant="outlined"
                            size="small"
                            sx={{
                              width: { xs: "100%", sm: "140px" },
                              height: { xs: "36px", sm: "40px" },
                              ml: { xs: 0, sm: 2 },
                              textTransform: "none",
                              borderRadius: "8px",
                              backgroundColor: "#FFFFFF",
                              borderColor: "#4071B6",
                              color: "#4071B6",
                              fontSize: { xs: "14px", sm: "16px" },
                              fontWeight: 600,
                            }}
                          >
                            <span className="flex items-center justify-center gap-2 sm:gap-3">
                              Details
                              <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12.5" cy="12" r="10" stroke="#4071B6" strokeWidth="1.5" />
                                <path d="M9.5 16L11.6 13.2C12.1333 12.4889 12.1333 11.5111 11.6 10.8L9.5 8" stroke="#4071B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.5 16L16.6 13.2C17.1333 12.4889 17.1333 11.5111 16.6 10.8L14.5 8" stroke="#4071B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6 text-gray-500 border-t border-gray-200">
                    <p className="text-sm sm:text-base">No applicants yet for this course</p>
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        {orders.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 px-3 sm:px-4 py-3 bg-white gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} out of {orders.length} records
            </div>
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handleChangePage}
                color="primary"
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              />
            </Stack>
          </div>
        )}
      </div>

      <ViewApplicants tutor={selectedTutor} order={selectedOrder} open={showTutorModal} onClose={handleCloseModal} />
    </div>
  )
}
