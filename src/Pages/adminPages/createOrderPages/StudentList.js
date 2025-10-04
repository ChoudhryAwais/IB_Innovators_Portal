"use client"

import { useState, useEffect, useContext } from "react"
import { db } from "../../../firebase"
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { MyContext } from "../../../Context/MyContext"
import { Modal, Box, Typography, Button } from "@mui/material"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import { CreateOrderForm } from "./CreateOrderForm"
import CustomModal from "../../../Components/CustomModal/CustomModal";
import Divider from "@mui/material/Divider"

export function StudentList() {
  const { userDetails } = useContext(MyContext)

  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState({})
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  const [students, setStudents] = useState([])
  const [searchedStudents, setSearchedStudents] = useState([])


  const fetchData = () => {
    try {
      const userListRef = collection(db, "studentRequests")

      const unsubscribe = onSnapshot(userListRef, (querySnapshot) => {
        const studentData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }))
        setStudents(studentData)
        setSearchedStudents(studentData)
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
    const searchedData = e.target.value.toLowerCase()

    if (searchedData.length >= 2) {
      setSearchedStudents(
        students.filter((item) => {
          return (
            item?.studentInformation?.userName?.toLowerCase().includes(searchedData) ||
            item?.studentInformation?.email?.toLowerCase().includes(searchedData) ||
            item?.studentInformation?.userId?.toLowerCase().includes(searchedData)
          )
        }),
      )
    } else {
      setSearchedStudents(students)
    }
  }

  const itemsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = searchedStudents?.slice(startIndex, endIndex)

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteDoc(doc(db, "studentRequests", studentToDelete.docId))
        setDeleteModalOpen(false)
        setStudentToDelete(null)
      } catch (error) {
        console.error("Error deleting student:", error)
      }
    }
  }

  return (
  <div className="flex flex-col flex-1 min-h-screen">
    {students.length !== 0 && (
      <div className="mb-4 sm:mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 sm:w-[21.5px] sm:h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
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
          className="w-full h-[40px] sm:h-[50px] pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          defaultValue=""
        />
      </div>
    )}

    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-3 sm:space-y-4">
        {displayedSessions.map((student, index) => (
          <div
            key={student?.docId || index}
            className="flex items-stretch p-3 sm:p-4 border-b border-gray-200 bg-white"
          >
            {/* Info + Actions */}
            <div className="flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-0">
              {/* Left Side - Avatar + Info */}
              <div className="flex-1">
                {/* Avatar + Student Name */}
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-300 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <img
                      src="/profile-picture-of-.jpg"
                      alt={student?.studentInformation?.userName}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-[#16151C] text-[16px] sm:text-[18px] truncate">
                    {student?.studentInformation?.userName}
                  </h3>
                </div>

                {/* Student Details (indented under name) */}
                <div className="text-sm text-gray-600 mt-2 pl-0 sm:pl-[4.5rem] space-y-1">
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-28 sm:w-40 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">Email:</span>
                    <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium truncate">
                      {student?.studentInformation?.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-28 sm:w-40 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">Country:</span>
                    <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium">
                      {student?.country}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="w-28 sm:w-40 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">Course Requested:</span>
                    <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium">
                      {student?.subject}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Info + Buttons */}
              <div className="flex items-start sm:items-end flex-shrink-0">
                <div className="flex flex-col items-start sm:items-center flex-shrink-0 text-left sm:text-center space-y-2 sm:space-y-3 w-full sm:w-[270px]">
                  {/* Info Section */}
                  <div className="flex flex-col space-y-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1">
                      <span className="font-light text-[#16151C] text-[12px]">Required by:</span>
                      <span className="font-light text-[#16151C] text-[12px] truncate">
                        {student?.studentInformation?.userName}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-1">
                      <span className="font-light text-[#16151C] text-[12px]">Hourly Rate (USD):</span>
                      <span className="font-light text-[#16151C] text-[12px]">
                        ${student?.tutorHourlyRate}
                      </span>
                    </div>
                  </div>

                  {/* Buttons Section */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                    <Button
                      onClick={() => {
                        setStudentToDelete(student)
                        setDeleteModalOpen(true)
                      }}
                      variant="outlined"
                      sx={{
                        borderRadius: "8px",
                        width: "100%",
                        sm: { width: "130px" },
                        height: "36px",
                        sm: { height: "40px" },
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
                      onClick={() => {
                        setSelectedStudent(student)
                        setShowModal(true)
                      }}
                      variant="contained"
                      sx={{
                        borderRadius: "8px",
                        width: "100%",
                        sm: { width: "130px" },
                        height: "36px",
                        sm: { height: "40px" },
                        color: "#FFFFFF",
                        backgroundColor: "#4071B6",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "none",
                      }}
                    >
                      View & Create Job
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {searchedStudents?.length > itemsPerPage && (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 px-3 sm:px-4 py-3 bg-white gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of {searchedStudents.length}{" "}
          records
        </div>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(searchedStudents?.length / itemsPerPage)}
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

    {searchedStudents.length === 0 && (
      <div className="flex-1 flex items-center justify-center py-8 sm:py-0">
        <div className="text-center text-gray-400 text-lg sm:text-xl">No Requests</div>
      </div>
    )}

      {/* <Modal open={showModal} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
        <CreateOrderForm item={selectedStudent} handleClose={setShowModal} />
      </Modal> */}
      <CustomModal
        open={showModal}
        onClose={setShowModal}
        PaperProps={{
          sx: {
            width: "1080px",
            height: "auto",
            maxWidth: "95vw",
            maxHeight: "90vh",
            overflow: "hidden",
            borderRadius: "10px",
            padding: 0,
          },
        }}
      >
        <CreateOrderForm item={selectedStudent} handleClose={setShowModal} />
      </CustomModal>

      <CustomModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
          Confirm Deletion
        </h2>

        {/* Divider */}
        <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

        {/* Message */}
        <p className="text-lg text-center font-light text-[#16151C] mb-12">
          Are you sure you want to delete this student request?
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => setDeleteModalOpen(false)}
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
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CustomModal>

    </div>
  )
}
