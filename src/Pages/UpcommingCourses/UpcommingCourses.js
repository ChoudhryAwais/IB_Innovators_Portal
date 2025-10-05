"use client"

import React, { useState, useEffect } from "react"
import { db } from "../../firebase"
import { collection, addDoc, setDoc, doc, deleteDoc, onSnapshot, updateDoc } from "firebase/firestore"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import toast from "react-hot-toast"
import Divider from "@mui/material/Divider"
import { FormControl, InputLabel, MenuItem, Select, TextField, InputAdornment } from "@mui/material"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const FormComponent = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Upcoming Course")
    setSecondMessage("Show all Courses")
  }, [setFirstMessage, setSecondMessage])

  const [formData, setFormData] = useState({
    heading: "",
    tagline: "",
    startDate: "",
    endDate: "",
    lastDate: "",
    sessionNumber: "",
  })

  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedLink, setSelectedLink] = useState({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isEditMode) {
      await updateDoc(doc(db, "UpcomingCourses", selectedCourse.id), formData)
      toast.success("Course updated successfully!")
    } else {
      const coursesRef = collection(db, "UpcomingCourses")
      const docRef = await addDoc(coursesRef, formData)
      const courseId = docRef.id
      const updatedFormData = { ...formData, id: courseId }
      await setDoc(doc(db, "UpcomingCourses", courseId), updatedFormData)
      toast.success("Course added successfully!")
    }

    setFormData({
      heading: "",
      tagline: "",
      startDate: "",
      endDate: "",
      lastDate: "",
      sessionNumber: "",
    })
    setIsEditMode(false)
    setShowEditModal(false)
    setShowCreateModal(false)
    setSelectedCourse(null)
  }

  const [receivedData, setReceivedData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const blogsRef = collection(db, "UpcomingCourses")
      const unsubscribe = onSnapshot(blogsRef, (snapshot) => {
        const blogsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setReceivedData(blogsArray)
      })
      return () => unsubscribe()
    }

    fetchData()
  }, [])

  const deleteCourse = async (id) => {
    await deleteDoc(doc(db, "UpcomingCourses", id))
    setShowModal(false)
    toast.success("Course deleted")
  }

  const openEditModal = (course) => {
    setFormData(course)
    setSelectedCourse(course)
    setIsEditMode(true)
    setShowEditModal(true)
  }

  const upcomingItemsPerPage = 3
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1)

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage)
  }

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage
  const upcomingDisplayedSessions = receivedData?.slice(upcomingStartIndex, upcomingEndIndex)

  const options = [
    "Summer Course",
    "Rapid Revision Course",
    "Winter Bootcamp",
    "Spring Short Course & Paper Practice Session",
  ]

  return (
    <TopHeadingProvider>
      <div className="min-h-screen p-4 sm:p-6">
        {/* Conditional Rendering */}
        {receivedData.length === 0 ? (
          <div className="flex flex-col border border-[#A2A1A833] rounded-[10px] items-center justify-center min-h-[70vh] gap-6 p-4 sm:p-0">
            <Button
              variant="contained"
              onClick={() => setShowCreateModal(true)}
              sx={{
                backgroundColor: "#4071B6",
                width: { xs: "100%", sm: "250px" },
                height: { xs: "44px", sm: "50px" },
                "&:hover": { backgroundColor: "#427ac9ff" },
                color: "white",
                px: 3,
                py: 1.5,
                borderRadius: "0.5rem",
                fontWeight: 600,
                textTransform: "none",
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              + Create a new Course
            </Button>
            <p className="text-[#16151C] text-lg sm:text-2xl font-light text-center">No Courses Yet!</p>
          </div>
        ) : (
          <div className="p-4 sm:p-7 border border-[#A2A1A833] rounded-[10px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
              <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#16151C]">
                Upcoming Courses ({receivedData.length.toString().padStart(2, "0")})
              </h1>
              <Button
                variant="contained"
                onClick={() => setShowCreateModal(true)}
                sx={{
                  backgroundColor: "#4071B6",
                  width: { xs: "100%", sm: "250px" },
                  height: { xs: "44px", sm: "50px" },
                  "&:hover": { backgroundColor: "#427ac9ff" },
                  color: "white",
                  px: 3,
                  py: 1.5,
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "14px", sm: "16px" },
                }}
              >
                + Create a new Course
              </Button>
            </div>

            <div className="flex-1 space-y-6">
              {upcomingDisplayedSessions.map((item, index) => (
                <div key={index} className="bg-white border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex flex-col">
                    <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#4071B6] mb-2">{item.heading}</h3>
                    <p className="text-[#16151C] text-[14px] sm:text-[16px] mb-3 sm:mb-0">
                      <span className="font-light">Tagline:</span>{" "}
                      <span className="font-bold">{item.tagline}</span>
                    </p>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:gap-8 text-[14px] sm:text-[16px] space-y-1 sm:space-y-0">
                        <span className="text-[#16151C]">
                          <span className="font-light">Start Date:</span>{" "}
                          <span className="font-bold">{item.startDate}</span>
                        </span>
                        <span className="text-[#16151C]">
                          <span className="font-light">End Date:</span>{" "}
                          <span className="font-bold">{item.endDate}</span>
                        </span>
                        <span className="text-[#16151C]">
                          <span className="font-light">Last Date:</span>{" "}
                          <span className="font-bold text-[#A81E1E]">{item.lastDate}</span>
                        </span>
                      </div>

                      <div className="flex gap-3 mb-2">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setShowModal(true)
                            setSelectedLink(item)
                          }}
                          sx={{
                            borderRadius: "8px",
                            width: "118px",
                            height: "36px",
                            color: "#A81E1E",
                            backgroundColor: "#A81E1E0D",
                            borderColor: "#A81E1E",
                            fontSize: "11.36px",
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => openEditModal(item)}
                          sx={{
                            borderRadius: "8px",
                            width: "118px",
                            height: "36px",
                            color: "#4071B6",
                            backgroundColor: "#4071B60D",
                            borderColor: "#4071B6",
                            fontSize: "11.36px",
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {receivedData?.length > upcomingItemsPerPage && (
              <div className="flex justify-center pt-6">
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(receivedData?.length / upcomingItemsPerPage)}
                    page={upcomingCurrentPage}
                    onChange={handleUpcomingChangePage}
                    size="small"
                  />
                </Stack>
              </div>
            )}
          </div>
        )}

        {/* Create Course Modal */}
        <Dialog
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          keepMounted={false}
          maxWidth={false}
          PaperProps={{
            sx: {
              borderRadius: "24px",
              width: { xs: "90%", sm: 760 },
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
          slotProps={{
            backdrop: {
              sx: {
                bgcolor: "#16151C33",
                backdropFilter: "blur(8px)",
              },
            },
          }}
        >
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Create a new Course</h2>
            <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />
            {/* Course selection buttons */}
            <p className="text-[12px] font-light text-[#16151C] mb-2">Select Course*</p>
            <div className="grid grid-cols-1 sm:flex sm:justify-between gap-3 mb-6">
              {options?.map((option) => (
                <Button
                  key={option}
                  variant={formData.heading === option ? "contained" : "outlined"}
                  onClick={() => setFormData((prev) => ({ ...prev, heading: option }))}
                  sx={{
                    fontSize: { xs: "10px", sm: "12px" },
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: "500",
                    whiteSpace: "normal",
                    lineHeight: 1.2,
                    px: 1,
                    color: formData.heading === option ? "#FFFFFF" : "#16151C",
                    borderColor: formData.heading === option ? "transparent" : "#A2A1A833",
                    backgroundColor: formData.heading === option ? "#4071B6" : "transparent",
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>

            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              <div>
                <p className="text-[12px] font-light text-[#16151C] mb-1">Tagline *</p>
                <TextField
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Add a tag line"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",   // default border
                      },
                    },
                  }}
                />
              </div>

              {/* Start Date */}
              <div style={{ position: "relative" }}>
                <p className="text-[12px] font-light text-[#16151C] mb-1">Start Date *</p>
                <TextField
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "#A2A1A833" },
                      "& input::-webkit-calendar-picker-indicator": {
                        opacity: 0,
                        display: "block",
                        cursor: "pointer",
                      },
                      paddingRight: "36px", // space for the SVG
                    },
                  }}
                />
                {/* Custom SVG icon */}
                <div
                  onClick={() => document.querySelector('input[name="startDate"]').showPicker?.()}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)", // centers vertically
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                    marginTop: "10px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="#16151C" stroke-width="1.5"/>
                      <path d="M3 9H21" stroke="#16151C" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M8 2L8 5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 2V5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="15" r="1" fill="#16151C"/>
                      <circle cx="16" cy="15" r="1" fill="#16151C"/>
                      <circle cx="8" cy="15" r="1" fill="#16151C"/>
                    </svg>`,
                  }}
                />
              </div>

              {/* End Date */}
              <div style={{ position: "relative", marginTop: "16px" }}>
                <p className="text-[12px] font-light text-[#16151C] mb-1">End Date *</p>
                <TextField
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "#A2A1A833" },
                      "& input::-webkit-calendar-picker-indicator": {
                        opacity: 0,
                        display: "block",
                        cursor: "pointer",
                      },
                      paddingRight: "36px",
                    },
                  }}
                />
                <div
                  onClick={() => document.querySelector('input[name="endDate"]').showPicker?.()}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                    marginTop: "10px",

                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="#16151C" stroke-width="1.5"/>
                    <path d="M3 9H21" stroke="#16151C" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 2L8 5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 2V5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="15" r="1" fill="#16151C"/>
                    <circle cx="16" cy="15" r="1" fill="#16151C"/>
                    <circle cx="8" cy="15" r="1" fill="#16151C"/>
                  </svg>`,
                  }}
                />
              </div>

              {/* Last Date */}
              <div style={{ position: "relative", marginTop: "16px" }}>
                <p className="text-[12px] font-light text-[#16151C] mb-1">Last Date *</p>
                <TextField
                  name="lastDate"
                  type="date"
                  value={formData.lastDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "#A2A1A833" },
                      "& input::-webkit-calendar-picker-indicator": {
                        opacity: 0,
                        display: "block",
                        cursor: "pointer",
                      },
                      paddingRight: "36px",
                    },
                  }}
                />
                <div
                  onClick={() => document.querySelector('input[name="lastDate"]').showPicker?.()}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                    marginTop: "10px",

                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="#16151C" stroke-width="1.5"/>
                        <path d="M3 9H21" stroke="#16151C" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 2L8 5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 2V5" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="15" r="1" fill="#16151C"/>
                        <circle cx="16" cy="15" r="1" fill="#16151C"/>
                        <circle cx="8" cy="15" r="1" fill="#16151C"/>
                      </svg>`,
                  }}
                />
              </div>

              <div>
                <p className="text-[12px] font-light text-[#16151C] mb-1">Session Number *</p>
                <TextField
                  name="sessionNumber"
                  value={formData.sessionNumber}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Add a Session Number"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",   // default border
                      },
                    },
                  }}
                />
              </div>

              <DialogActions className="px-0 gap-2 flex-col sm:flex-row">
                <Button variant="outlined"
                  onClick={() => setShowCreateModal(false)}
                  sx={{
                    borderRadius: "10px",
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 44, sm: 50 },
                    color: "#16151C",
                    borderColor: "#A2A1A833"
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained" type="submit"
                  sx={{
                    borderRadius: "10px",
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 44, sm: 50 },
                    color: "#FFFFFF",
                    backgroundColor: "#4071B6",
                    fontWeight: 600,
                  }}
                >
                  {isEditMode ? "Update Course" : "Create Course"}
                </Button>
              </DialogActions>
            </form>
          </div>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setIsEditMode(false)
            setFormData({
              heading: "",
              tagline: "",
              startDate: "",
              endDate: "",
              lastDate: "",
              sessionNumber: "",
            })
          }}
          keepMounted={false}
          maxWidth={false}
          PaperProps={{
            sx: {
              borderRadius: "24px",
              width: { xs: "90%", sm: 760 },
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
          slotProps={{
            backdrop: {
              sx: {
                bgcolor: "#16151C33",
                backdropFilter: "blur(8px)",
              },
            },
          }}
        >
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Edit Course</h2>
            <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />

            {/* Course selection buttons */}
            <p className="text-xs font-medium text-gray-800 mb-2">Select Course*</p>
            <div className="grid grid-cols-1 sm:flex sm:justify-between gap-3 mb-6">
              {options?.map((option) => (
                <Button
                  key={option}
                  variant={formData.heading === option ? "contained" : "outlined"}
                  onClick={() => setFormData((prev) => ({ ...prev, heading: option }))}
                  sx={{
                    fontSize: { xs: "10px", sm: "12px" },
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: "500",
                    whiteSpace: "normal",
                    lineHeight: 1.2,
                    px: 1,
                    color: formData.heading === option ? "#FFFFFF" : "#16151C",
                    borderColor: formData.heading === option ? "transparent" : "#A2A1A833",
                    backgroundColor: formData.heading === option ? "#4071B6" : "transparent",
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>

            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              <div>
                <p className="text-xs font-medium text-gray-800 mb-1">Tagline *</p>
                <TextField
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Add a tag line"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-800 mb-1">Start Date *</p>
                <TextField
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-800 mb-1">End Date *</p>
                <TextField
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-800 mb-1">Last Date *</p>
                <TextField
                  name="lastDate"
                  type="date"
                  value={formData.lastDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-800 mb-1">Session Number *</p>
                <TextField
                  name="sessionNumber"
                  value={formData.sessionNumber}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Add a Session Number"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": {
                        borderColor: "#A2A1A833",
                      },
                    },
                  }}
                />
              </div>

              <DialogActions className="px-0 gap-2 flex-col sm:flex-row">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowEditModal(false)
                    setIsEditMode(false)
                    setFormData({
                      heading: "",
                      tagline: "",
                      startDate: "",
                      endDate: "",
                      lastDate: "",
                      sessionNumber: "",
                    })
                  }}
                  sx={{
                    borderRadius: "10px",
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 44, sm: 50 },
                    color: "#16151C",
                    borderColor: "#A2A1A833",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    borderRadius: "10px",
                    width: { xs: "100%", sm: 166 },
                    height: { xs: 44, sm: 50 },
                    color: "#FFFFFF",
                    backgroundColor: "#4071B6",
                  }}
                >
                  Update Course
                </Button>
              </DialogActions>
            </form>
          </div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          PaperProps={{
            className: "bg-white shadow-xl p-6 mx-4",
            sx: {
              borderRadius: "24px",
              width: { xs: "90%", sm: 382 },
              height: { xs: "auto", sm: 318 }
            },
          }}
          slotProps={{
            backdrop: {
              sx: {
                bgcolor: "#16151C33",
                backdropFilter: "blur(8px)",
              },
            },
          }}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-center text-[#16151C] mb-4 sm:mb-7">Delete</h2>
          <Divider sx={{ borderColor: "#E5E7EB", mb: 4 }} />
          <p className="text-base sm:text-lg text-center font-light text-[#16151C] mb-6 sm:mb-12">
            Are you sure you want to Delete this Upcoming Course?
          </p>
          <DialogActions className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={() => setShowModal(false)}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: 166 },
                height: { xs: 44, sm: 50 },
                borderRadius: "10px",
                borderColor: "#A2A1A833",
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 300,
                color: "#16151C"

              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteCourse(selectedLink?.id)}
              variant="contained"
              color="primary"
              sx={{
                width: { xs: "100%", sm: 166 },
                height: { xs: 44, sm: 50 },
                borderRadius: "10px",
                backgroundColor: "#4071B6",
                fontSize: { xs: "16px", sm: "20px" },
                fontWeight: 300,
                color: "#FFFFFF"
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </TopHeadingProvider>
  )
}

export default FormComponent