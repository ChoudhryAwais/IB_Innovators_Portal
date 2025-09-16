"use client"

import React, { useState, useEffect } from "react"
import "react-quill/dist/quill.snow.css"
import { db, storage } from "../../firebase"
import { collection, doc, addDoc, deleteDoc, query, onSnapshot } from "firebase/firestore"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Slide,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Modal,
} from "@mui/material"
import EditBlog from "./EditBlog"
import { toast } from "react-hot-toast"

import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"
import { useNavigate } from "react-router-dom"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ color: ["red", "blue", "green", "black", "gray"] }],
    [{ font: [] }],
    [{ align: [] }],
    [{ size: ["small", false, "large", "huge"] }],
  ],
}

const formats = ["header", "bold", "italic", "underline", "color", "font", "align", "size"]

export default function Blogs() {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Blogs")
    setSecondMessage("Show all Blogs")
  }, [setFirstMessage, setSecondMessage])

  const [showEditModal, setShowEditModal] = useState(false)
  const [url, setUrl] = useState("")
  const [editorContent, setEditorContent] = useState("")
  const [image, setImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [header, setHeader] = useState("")
  const [seoTags, setSeoTags] = useState("")
  const [writtenBy, setWrittenBy] = useState("")
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setImage(URL.createObjectURL(file))
    }
  }

  const handleBlogSubmit = async () => {
    try {
      setLoading(true)
      if (selectedFile && url !== "" && header !== "" && editorContent !== "") {
        let imageUrl = ""
        if (selectedFile) {
          const randomString = Math.random().toString(36).substring(7)
          const newFileName = randomString + "_" + selectedFile.name
          const storageRef = ref(storage, "blog_images/" + newFileName)

          const fileArrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = (e) => reject(e)
            reader.readAsArrayBuffer(selectedFile)
          })

          await uploadBytes(storageRef, fileArrayBuffer)
          imageUrl = await getDownloadURL(storageRef)
        }

        const blogsRef = collection(db, "Blogs")
        await addDoc(blogsRef, {
          content: editorContent,
          image: imageUrl,
          header: header,
          createdOn: new Date(),
          seoTags,
          url,
          selectedTags,
          writtenBy,
          duration,
          description,
        })
        setEditorContent("")
        setImage(null)
        setSelectedFile(null)
        setHeader("")
        toast.success("Blog submitted successfully!")
      } else {
        toast.error("Please fill all details")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (event) => {
    const value = event.target.value
    if (!selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value])
    }
  }

  const handleDelete = (subjectToDelete) => {
    setSelectedTags((subjects) => subjects.filter((subject) => subject !== subjectToDelete))
  }

  const tags = [
    "Applying for University",
    "Efficiency",
    "Exam Tips",
    "IB - Understanding IT",
    "IB CAS",
    "IB Extended Essay",
    "IB Lanterna Courses",
    "IB Theory of Knowledge",
    "IGCSE",
    "Most Popular",
    "Plan for Success",
    "Quick Fix",
    "Revision Skills",
    "Student Self Care",
    "Study Skills",
    "Uncategorized",
  ]

  useEffect(() => {
    const q = query(collection(db, "Blogs"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    })
    return () => unsubscribe()
  }, [])

  const deleteBlog = async (id) => {
    await deleteDoc(doc(db, "Blogs", id))
    setBlogs(blogs.filter((blog) => blog.id !== id))
    setShowModal(false)
  }

  const editBlog = (blog) => {
    setEditorContent(blog.content)
    setImage(blog.image)
    setHeader(blog.header)
  }

  const upcomingItemsPerPage = 5
  const [upcomingCurrentPage, setUpcomingCurrentPage] = React.useState(1)
  const handleUpcomingChangePage = (event, newPage) => setUpcomingCurrentPage(newPage)
  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage
  const upcomingDisplayedSessions = blogs?.slice(upcomingStartIndex, upcomingEndIndex)

  return (
    <TopHeadingProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Existing Blogs</h1>
            <button
              onClick={() => navigate("/blogs/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Create a new Blog
            </button>
          </div>

          {/* Blog Cards */}
          <div className="space-y-6">
            {upcomingDisplayedSessions.map((blog, index) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  {/* Author Avatar and Info */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {blog.writtenBy ? blog.writtenBy.charAt(0).toUpperCase() : "A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{blog.writtenBy || "Amit Das"}</p>
                      <p className="text-xs text-gray-500">4 days ago</p>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.header}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {blog.description ||
                        "An intense way to learn about the process and practice your designs skills — My 1st hackathon Hackathons have been on my mind since I heard it was a good way to gain experience as a junior UX designer. As my portfolio..."}
                    </p>
                  </div>

                  {/* Blog Image */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-32 h-20 bg-black rounded-lg overflow-hidden">
                      {blog.image ? (
                        <img
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.header}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <div className="text-green-200">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedLink(blog)
                        setShowModal(true)
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => navigate("/blogs/new")}
                      className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Blogs Message */}
          {blogs?.length === 0 && <div className="text-center text-gray-400 text-xl py-20">No Blogs</div>}

          {/* Pagination */}
          {blogs?.length > upcomingItemsPerPage && (
            <div className="flex items-center justify-center mt-8">
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(blogs?.length / upcomingItemsPerPage)}
                  page={upcomingCurrentPage}
                  onChange={handleUpcomingChangePage}
                />
              </Stack>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <Dialog
          open={showModal}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => setShowModal(false)}
        >
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Are you sure you want to delete this Post?
          </DialogTitle>
          <DialogActions className="flex gap-2 p-4">
            <Button
              onClick={() => setShowModal(false)}
              sx={{
                border: "1px solid #d1d5db",
                color: "#374151",
                textTransform: "none",
                "&:hover": { backgroundColor: "#f9fafb" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteBlog(selectedLink?.id)}
              sx={{
                backgroundColor: "#2563eb",
                color: "white",
                textTransform: "none",
                "&:hover": { backgroundColor: "#1d4ed8" },
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>


        {/* Edit Modal (kept intact for other workflow) */}
        <Modal open={showEditModal}>
          <EditBlog item={selectedLink} onClose={() => setShowEditModal(false)} />
        </Modal>
      </div>
    </TopHeadingProvider>
  )
}
