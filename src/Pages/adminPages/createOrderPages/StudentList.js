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

export function StudentList() {
  const { userDetails } = useContext(MyContext)

  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState({})
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  const [students, setStudents] = useState([])
  const [searchedStudents, setSearchedStudents] = useState([])

  useEffect(() => {
  const mockStudents = [
    {
      docId: "STU1001",
      studentInformation: {
        userName: "Emma Watson",
        email: "emma.watson@example.com",
        userId: "U001",
      },
      country: "USA",
      subject: "Mathematics",
      yearOfGraduation: 2025,
      timeZone: "EST",
      gmt: "GMT-5",
      session: "Spring",
      tutorTier: "Gold",
      credits: 3,
      requestedHours: 5,
      startDate: "2025-09-15",
      slotRequired: ["Monday-Before 12PM", "Wednesday-3PM - 6PM"], // timetable
    },
    {
      docId: "STU1002",
      studentInformation: {
        userName: "Ali Raza",
        email: "ali.raza@example.com",
        userId: "U002",
      },
      country: "Pakistan",
      subject: "Physics",
      yearOfGraduation: 2024,
      timeZone: "PKT",
      gmt: "GMT+5",
      session: "Fall",
      tutorTier: "Silver",
      credits: 2,
      requestedHours: 4,
      startDate: "Other",
      customStartDate: "2025-10-01",
      slotRequired: ["Tuesday-12PM - 3PM", "Thursday-After 6PM"],
    },
    {
      docId: "STU1001",
      studentInformation: {
        userName: "Emma Watson",
        email: "emma.watson@example.com",
        userId: "U001",
      },
      country: "USA",
      subject: "Mathematics",
      yearOfGraduation: 2025,
      timeZone: "EST",
      gmt: "GMT-5",
      session: "Spring",
      tutorTier: "Gold",
      credits: 3,
      requestedHours: 5,
      startDate: "2025-09-15",
      slotRequired: ["Monday-Before 12PM", "Wednesday-3PM - 6PM"], // timetable
    },
    {
      docId: "STU1001",
      studentInformation: {
        userName: "Emma Watson",
        email: "emma.watson@example.com",
        userId: "U001",
      },
      country: "USA",
      subject: "Mathematics",
      yearOfGraduation: 2025,
      timeZone: "EST",
      gmt: "GMT-5",
      session: "Spring",
      tutorTier: "Gold",
      credits: 3,
      requestedHours: 5,
      startDate: "2025-09-15",
      slotRequired: ["Monday-Before 12PM", "Wednesday-3PM - 6PM"], // timetable
    },
  ]

  setStudents(mockStudents)
  setSearchedStudents(mockStudents)
}, [])
  // const fetchData = () => {
  //   try {
  //     const userListRef = collection(db, "studentRequests")

  //     const unsubscribe = onSnapshot(userListRef, (querySnapshot) => {
  //       const studentData = querySnapshot.docs.map((doc) => ({
  //         ...doc.data(),
  //         docId: doc.id,
  //       }))
  //       setStudents(studentData)
  //       setSearchedStudents(studentData)
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
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      {students.length !== 0 && (
        <div className="mb-6 relative">
          <div className="relative">
            <FontAwesomeIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              icon={faMagnifyingGlass}
            />
            <input
              onChange={handleSearch}
              placeholder="Search by name/email"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue=""
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayedSessions.map((student, index) => (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" key={index}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  src="/profile-picture-of-.jpg"
                  alt={student?.studentInformation?.userName}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{student?.studentInformation?.userName}</h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    <span className="text-gray-900">{student?.studentInformation?.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Country:</span>{" "}
                    <span className="text-gray-900">{student?.country}</span>
                  </div>
                  <div>
                    <span className="font-medium">Course Requested:</span>{" "}
                    <span className="text-gray-900">{student?.subject}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  onClick={() => {
                    setStudentToDelete(student)
                    setDeleteModalOpen(true)
                  }}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => {
                    setSelectedStudent(student)
                    setShowModal(true)
                  }}
                >
                  View & Create Job
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searchedStudents?.length > itemsPerPage && (
        <div className="flex justify-center mt-8 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-4">
              Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of {searchedStudents.length}{" "}
              records
            </span>
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(searchedStudents?.length / itemsPerPage)}
                page={currentPage}
                onChange={handleChangePage}
                color="primary"
                size="medium"
              />
            </Stack>
          </div>
        </div>
      )}

      {searchedStudents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-xl">No Requests</div>
        </div>
      )}

      <Modal open={showModal} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
        <CreateOrderForm item={selectedStudent} handleClose={setShowModal} />
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography sx={{ mb: 2 }}>Are you sure you want to delete this student request?</Typography>
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}
