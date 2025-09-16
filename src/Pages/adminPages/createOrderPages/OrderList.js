"use client"

import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MyContext } from "../../../Context/MyContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "../../../firebase"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import CustomModal from "../../../Components/CustomModal/CustomModal";
import Divider from "@mui/material/Divider"


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export function OrderList() {
  const { userDetails } = useContext(MyContext)
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchedData, setSearchedData] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState("")

  useEffect(() => {
    const mockOrders = [
      {
        id: "ORD1001",
        studentName: "Alice Johnson",
        subject: "Mathematics",
        country: "USA",
        tutorHourlyRate: 25,
        yearOfGraduation: "2024",
        timeZone: "EST",
        studentInformation: { email: "alice.johnson@example.com" },
        applicants: [
          {
            tutorDetails: {
              userName: "John Smith",
              email: "john.smith@example.com",
              userId: "tutor1",
            },
            supportingInformation: "I have 5 years of experience teaching mathematics.",
          },
          {
              tutorDetails: {
                userName: "Dr. Emily Chen",
                email: "emily.chen@example.com",
                userId: "tutor3",
              },
              supportingInformation: "Physics professor with 10 years of teaching experience.",
            },
        ],
      },
      {
        id: "ORD1002",
        studentName: "Mohammed Ali",
        subject: "Physics",
        country: "Pakistan",
        tutorHourlyRate: 30,
        studentInformation: { email: "mohammed.ali@example.com" },
      },
      {
        id: "ORD1003",
        studentName: "Sophie Lee",
        subject: "Biology",
        country: "UK",
        tutorHourlyRate: 28,
        studentInformation: { email: "sophie.lee@example.com" },
      },
      {
        id: "ORD1004",
        studentName: "Carlos Martinez",
        subject: "Chemistry",
        country: "Canada",
        tutorHourlyRate: 32,
        studentInformation: { email: "carlos.martinez@example.com" },
      },
      {
        id: "ORD1005",
        studentName: "Priya Sharma",
        subject: "English Literature",
        country: "India",
        tutorHourlyRate: 22,
        studentInformation: { email: "priya.sharma@example.com" },
      },
      {
        id: "ORD1006",
        studentName: "David Brown",
        subject: "Computer Science",
        country: "Australia",
        tutorHourlyRate: 35,
        studentInformation: { email: "david.brown@example.com" },
      },
      {
        id: "ORD1007",
        studentName: "George Abbot",
        subject: "Humanities",
        country: "America",
        tutorHourlyRate: 20,
        studentInformation: { email: "george.abbot@example.com" },
      },
    ]

    setData(mockOrders)
    setSearchedData(mockOrders)
  }, [])

  // Fetch orders
  // const fetchData = () => {
  //   try {
  //     const userListRef = collection(db, "orders")
  //     const unsubscribe = onSnapshot(query(userListRef, orderBy("createdOn", "desc")), (querySnapshot) => {
  //       const orderData = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }))
  //       setData(orderData)
  //       setSearchedData(orderData)
  //     })
  //     return unsubscribe
  //   } catch (e) {
  //     console.error("Error fetching data:", e)
  //   }
  // }

  // useEffect(() => {
  //   const unsubscribe = fetchData()
  //   return () => {
  //     unsubscribe()
  //   }
  // }, [])

  function handleSearch(e) {
    const searchedText = e.target.value.toLowerCase()
    if (searchedText.length >= 2) {
      setSearchedData(
        data.filter((item) => {
          return (
            item?.studentName?.toLowerCase().includes(searchedText) ||
            item?.subject?.toLowerCase().includes(searchedText) ||
            item?.id?.toLowerCase().includes(searchedText) ||
            item?.studentInformation?.email?.toLowerCase().includes(searchedText) ||
            item?.country?.toLowerCase().includes(searchedText)
          )
        }),
      )
    } else {
      setSearchedData(data)
    }
  }

  // Pagination
  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = searchedData?.slice(startIndex, endIndex)

  // Navigation function to replace modal opening
  const handleViewApplicants = (clickedOrderId) => {
    const index = searchedData.findIndex(order => order.id === clickedOrderId);
    const pageOfClickedOrder = Math.floor(index / itemsPerPage) + 1;

    navigate("/applicantsList", {
      state: {
        orders: searchedData,
        expandedOrderId: clickedOrderId,
        currentPage: pageOfClickedOrder
      },
    });
  };

  // 🔥 Delete Logic
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "orders", deleteTargetId))
      setData((prev) => prev.filter((item) => item.id !== deleteTargetId))
      setSearchedData((prev) => prev.filter((item) => item.id !== deleteTargetId))
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setDeleteDialogOpen(false)
      setDeleteTargetId("")
    }
  }

  return (
    <div className="flex-1 min-h-screen">
      {data.length !== 0 && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon className="text-gray-400" icon={faMagnifyingGlass} />
          </div>
          <input
            onChange={handleSearch}
            placeholder="Search by name/email"
            className="w-full h-[50px] pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            defaultValue=""
          />
        </div>
      )}

      <div className="space-y-4">
        {displayedSessions.map((item, index) => (
          <div key={item?.id} className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src="/profile-picture-of-.jpg"
                  alt={item?.studentName}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Student Name Header */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item?.studentName}</h3>

                {/* Order Information */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Order ID:</span>
                    <span className="text-sm font-medium text-gray-900">{item?.id}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Country:</span>
                    <span className="text-sm font-medium text-gray-900">{item?.country}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-32">Course Requested:</span>
                    <span className="text-sm font-medium text-gray-900">{item?.subject}</span>
                  </div>
                </div>
              </div>

              {/* Right Side Info and Actions */}
              <div className="flex-shrink-0 text-right">
                <div className="mb-4">
                  <div className="text-sm text-gray-700 mb-1">Required by Student Nome</div>
                  <div className="text-sm font-medium text-gray-900">Hourly Rate(USD): ${item?.tutorHourlyRate}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteClick(item?.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewApplicants(item.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searchedData?.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white ">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, searchedData.length)} out of {searchedData.length} records
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(searchedData?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
              color="primary"
              size="small"
            />
          </Stack>
        </div>
      )}

      {searchedData?.length === 0 && <div className="flex-1 text-center text-gray-400 text-xl py-12">No Orders</div>}

      {/* Delete Confirmation Dialog */}
      <CustomModal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
  {/* Title */}
  <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
    Delete Order?
  </h2>

  {/* Divider */}
  <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

  {/* Message */}
  <p className="text-lg text-center font-light text-[#16151C] mb-12">
    Are you sure you want to delete this order? This action cannot be undone.
  </p>

  {/* Actions */}
  <div className="flex gap-3 justify-end">
    <Button
      onClick={() => setDeleteDialogOpen(false)}
      variant="outlined"
      sx={{
        width: 166,
        height: 50,
        borderRadius: "10px",
        borderColor: "#A2A1A833",
        fontSize: "16px",
        fontWeight: 300,
        color: "#16151C",
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      sx={{
        width: 166,
        height: 50,
        borderRadius: "10px",
        backgroundColor: "#4071B6", // blue for delete action
        fontSize: "20px",
        fontWeight: 300,
        color: "#FFFFFF",
      }}
      onClick={confirmDelete}
    >
       "Delete"
    </Button>
  </div>
</CustomModal>

    </div>
  )
}
