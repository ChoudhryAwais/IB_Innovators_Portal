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
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
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
      <div className="min-h-screen p-6">
        {/* Conditional Rendering */}
        {receivedData.length === 0 ? (
          <div className="flex flex-col border border-[#A2A1A833] rounded-[10px] items-center justify-center min-h-[70vh] gap-6">
            <Button
                variant="contained"
                onClick={() => setShowCreateModal(true)}
                sx={{
                  backgroundColor: "#4071B6",
                  width: "250px",
                  height: "50px",
                  "&:hover": { backgroundColor: "#427ac9ff" },
                  color: "white",
                  px: 3,
                  py: 1.5,
                  borderRadius: "0.5rem",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                + Create a new Course
              </Button>
            <p className="text-[#16151C] text-2xl font-light">No Courses Yet!</p>
          </div>
        ) : (
          <div className="p-7 border border-[#A2A1A833] rounded-[10px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-[24px] font-semibold text-[#16151C]">
                Upcoming Courses ({receivedData.length.toString().padStart(2, "0")})
              </h1>
              <Button
                variant="contained"
                onClick={() => setShowCreateModal(true)}
                sx={{
                  backgroundColor: "#4071B6",
                  width: "250px",
                  height: "50px",
                  "&:hover": { backgroundColor: "#427ac9ff" },
                  color: "white",
                  px: 3,
                  py: 1.5,
                  borderRadius: "0.5rem",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                + Create a new Course
              </Button>
            </div>

            <div className="flex-1 space-y-6">
              {upcomingDisplayedSessions.map((item, index) => (
                <div key={index} className="bg-white border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-[#4071B6] mb-1">{item.heading}</h3>
                    <p className="text-[#16151C] text-lg">
                      <span className="font-light">Tagline:</span>{" "}
                      <span className="font-bold">{item.tagline}</span>
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-8 text-lg">
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

                      <div className="flex gap-3">
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
              width: 760,
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
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create a new Course</h2>
            <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />
            {/* Course selection buttons */}
            <p className="text-xs font-medium text-gray-800 mb-2">Select Course*</p>
            <div className="flex justify-between gap-3 mb-6">
              {options?.map((option) => (
                <Button
                  key={option}
                  variant={formData.heading === option ? "contained" : "outlined"}
                  onClick={() => setFormData((prev) => ({ ...prev, heading: option }))}
                  sx={{
                    fontSize: "12px",
                    width: 166,
                    height: 56,
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
                        borderColor: "#A2A1A833",   // default border
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
                        borderColor: "#A2A1A833",   // default border
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
                        borderColor: "#A2A1A833",   // default border
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
                        borderColor: "#A2A1A833",   // default border
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
                        borderColor: "#A2A1A833",   // default border
                      },
                    },
                  }}
                />
              </div>

              <DialogActions className="px-0 gap-2">
                <Button variant="outlined"
                  onClick={() => setShowCreateModal(false)}
                  sx={{
                    borderRadius: "10px",
                    width: 166,
                    height: 50,
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
                    width: 166,
                    height: 50,
                    color: "#FFFFFF",
                    backgroundColor: "#4071B6",
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
              width: 760,
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
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Course</h2>
            <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />

            {/* Course selection buttons */}
            <p className="text-xs font-medium text-gray-800 mb-2">Select Course*</p>
            <div className="flex justify-between gap-3 mb-6">
              {options?.map((option) => (
                <Button
                  key={option}
                  variant={formData.heading === option ? "contained" : "outlined"}
                  onClick={() => setFormData((prev) => ({ ...prev, heading: option }))}
                  sx={{
                    fontSize: "12px",
                    width: 166,
                    height: 56,
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

              <DialogActions className="px-0 gap-2">
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
                    width: 166,
                    height: 50,
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
                    width: 166,
                    height: 50,
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
            className:
              "bg-white shadow-xl p-6 mx-4",
            sx: {
              borderRadius: "24px",
              width: 382,
              height: 318
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
          <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">Delete</h2>
          <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />
          <p className="text-lg text-center font-light text-[#16151C] mb-12">
            Are you sure you want to Delete this Upcoming Course?
          </p>
          <DialogActions className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowModal(false)}
              variant="outlined"
              sx={{
                width: 166,
                height: 50,
                borderRadius: "10px",
                borderColor: "#A2A1A833",
                fontSize: "16px",
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
                width: 166,
                height: 50,
                borderRadius: "10px",
                backgroundColor: "#4071B6",
                fontSize: "20px",
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
