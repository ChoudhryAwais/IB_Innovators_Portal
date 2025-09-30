"use client"

import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MyContext } from "../../../Context/MyContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { collection, getDocs, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

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
  const [selectedItem, setSelectedItem] = useState({});

  // Fetch orders
  const fetchData = () => {
    try {
      const userListRef = collection(db, "orders")
      const unsubscribe = onSnapshot(query(userListRef, orderBy("createdOn", "desc")), (querySnapshot) => {
        const orderData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setData(orderData)
        setSearchedData(orderData)
      })
      return unsubscribe
    } catch (e) {
      console.error("Error fetching data:", e)
    }

  }

  useEffect(() => {
    const unsubscribe = fetchData()
    return () => {
      unsubscribe()
    }
  }, [])

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
    // Find index of clicked order in the currently filtered list
    const index = searchedData.findIndex(order => order.id === clickedOrderId);

    // Calculate page number for pagination
    const pageOfClickedOrder = Math.floor(index / itemsPerPage) + 1;

    // Navigate and send full list, selected item, and page number
    navigate("/applicantsList", {
      state: {
        orders: searchedData,         // full list
        expandedOrderId: clickedOrderId, // selected order
        currentPage: pageOfClickedOrder  // current page of clicked item
      }
    });
  };

  //  Delete Logic
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
            <svg
              className="w-[21.5px] h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
              viewBox="0 0 22 22"
              fill="#16151C"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.75 10.5C1.75 15.3325 5.66751 19.25 10.5 19.25C15.3325 19.25 19.25 15.3325 19.25 10.5C19.25 5.66751 15.3325 1.75 10.5 1.75C5.66751 1.75 1.75 5.66751 1.75 10.5ZM10.5 20.75C4.83908 20.75 0.25 16.1609 0.25 10.5C0.25 4.83908 4.83908 0.25 10.5 0.25C16.1609 0.25 20.75 4.83908 20.75 10.5C20.75 13.0605 19.8111 15.4017 18.2589 17.1982L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L17.1982 18.2589C15.4017 19.8111 13.0605 20.75 10.5 20.75Z"
              />
            </svg>
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
          <div
            key={item?.id}
            className="flex items-stretch p-4 border-b border-gray-200 bg-white"
          >
            {/* Info + Actions */}
            <div className="flex justify-between w-full">
              {/* Left Side - Avatar + Info */}
              <div className="flex-1">
                {/* Avatar + Student Name */}
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gray-300 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <img
                      src="/profile-picture-of-.jpg"
                      alt={item?.studentName}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-[#16151C] text-[18px]">
                    {item?.studentName}
                  </h3>
                </div>

                {/* Order Details (indented under name) */}
                <div className="text-sm text-gray-600 mt-2 pl-[4.5rem] space-y-1">
                  <div className="flex">
                    <span className="w-40 font-light text-[#16151C] text-[14px]">Order ID:</span>
                    <span className="text-[#16151C] text-[14px] font-medium">{item?.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-light text-[#16151C] text-[14px]">Country:</span>
                    <span className="text-[#16151C] text-[14px] font-medium">{item?.country}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-light text-[#16151C] text-[14px]">Course Requested:</span>
                    <span className="text-[#16151C] text-[14px] font-medium">{item?.subject}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Buttons */}
              <div className="flex items-end flex-shrink-0">
                <div className="flex flex-col items-center flex-shrink-0 text-center space-y-3">
                  {/* Info Section */}
                  <div className="flex flex-col space-y-1 w-[270px]">
                    <div className="flex justify-center space-x-1">
                      <span className="font-light text-[#16151C] text-[12px]">Required by:</span>
                      <span className="font-light text-[#16151C] text-[12px]">
                        {item?.studentName}
                      </span>
                    </div>
                    <div className="flex justify-center space-x-1">
                      <span className="font-light text-[#16151C] text-[12px]">Hourly Rate (USD):</span>
                      <span className="font-light text-[#16151C] text-[12px]">
                        ${item?.tutorHourlyRate}
                      </span>
                    </div>
                  </div>

                  {/* Buttons Section */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDeleteClick(item?.id)}
                      variant="outlined"
                      sx={{
                        borderRadius: "8px",
                        width: "130px",
                        height: "40px",
                        color: "#A81E1E",
                        backgroundColor: "#A81E1E0D",
                        borderColor: "#A81E1E",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "none",
                      }}
                    >
                      Delete
                    </Button>

                    <Button
                      onClick={() => handleViewApplicants(item.id)}
                      variant="contained"
                      sx={{
                        borderRadius: "8px",
                        width: "130px",
                        height: "40px",
                        color: "#FFFFFF",
                        backgroundColor: "#4071B6",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "none",
                      }}
                    >
                      View Applicants
                    </Button>
                  </div>
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
              backgroundColor: "#4071B6",
              fontSize: "20px",
              fontWeight: 300,
              color: "#FFFFFF",
            }}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </CustomModal>

    </div>
  )
}
