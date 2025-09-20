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
                      <FontAwesomeIcon icon={faBarsStaggered} className="text-gray-700 text-md" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.subject}
                      </h3>
                      <p className="text-sm text-gray-600">{order.studentName}</p>
                    </div>
                  </div>

                  {/* Right - View Tutors info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        View Tutors
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.applicants?.length || 0} applicants
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
                            <h5 className="font-medium text-gray-900">
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
                            }}
                          >
                            Details
                            <img src={Ellipse} alt="icon" className="w-4 h-4 ml-2" />

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
