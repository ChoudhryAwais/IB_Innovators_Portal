"use client"

import React, { useState, useEffect } from "react"
import "react-quill/dist/quill.snow.css"
import { db, storage } from "../../firebase"
import { collection, doc, addDoc, deleteDoc, query, onSnapshot } from "firebase/firestore"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Divider from "@mui/material/Divider"
import CustomModal from "../../Components/CustomModal/CustomModal";

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
      setLoading(true);
      if (selectedFile && url !== "" && header !== "" && editorContent !== "") {
        let imageUrl = "";

        // First, upload the image to Firebase Storage
        if (selectedFile) {
          // Generate a random string to prepend to the file name
          const randomString = Math.random().toString(36).substring(7);

          // Get the file extension
          const fileExtension = selectedFile.name.split(".").pop();

          // Prepend the random string to the file name and concatenate the file extension
          const newFileName = randomString + "_" + selectedFile.name;

          // Create a storage reference with the new file name
          const storageRef = ref(storage, "blog_images/" + newFileName);

          const fileArrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(selectedFile);
          });

          await uploadBytes(storageRef, fileArrayBuffer);
          imageUrl = await getDownloadURL(storageRef);
        }

        // Then, save the blog content to Firestore
        const blogsRef = collection(db, "Blogs");
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
        });
        setEditorContent("");
        setImage(null);
        setSelectedFile(null);
        setHeader("");
        toast.success("Blog submitted successfully!");
      } else {
        toast.error("Please fill all details");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center  mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Existing Blogs</h1>
            <Button
              variant="contained"
              onClick={() => navigate("/blogs/new")}
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
              + Create a new Blog
            </Button>
          </div>

          {/* Blog Cards */}
          <div className="space-y-6">
            {upcomingDisplayedSessions.map((blog) => (
              <div
                key={blog.id}
                className="rounded-lg pb-4 flex gap-4 items-stretch relative border-b border-gray-200"
              >
                {/* Left Section: Author + Blog Content */}
                <div className="flex-1 flex items-start pb-5 pr-4">
                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {blog.writtenBy ? blog.writtenBy.charAt(0).toUpperCase() : "A"}
                        </span>
                      </div>
                      <div flex className="flex items-center gap-1">
                        <p className="text-sm  text-#16151C">
                          {blog.writtenBy || "Amit Das"}
                        </p>
                        <p className="text-sm text-[#757575]">- 4 days ago</p>
                      </div>
                    </div>

                    {/* Blog Title */}
                    <h3 className="text-lg text-[#16151C] mb-2">
                      {blog.header}
                    </h3>

                    {/* Blog Content */}
                    <p className="text-[#16151C] text-base leading-relaxed">
                      {blog.description ||
                        "N/A"}
                    </p>
                  </div>

                  {/* Blog Image */}
                  <div className="w-[140px] h-full bg-black rounded-lg overflow-hidden ml-4">
                    {blog.image ? (
                      <img
                        src={blog.image || "/placeholder.svg"}
                        alt={blog.header}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <div className="text-green-200">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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

                {/* Right Section: Buttons (bottom aligned) */}
                <div className="flex flex-col justify-end">
                  <div className="flex gap-3">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedLink(blog);
                        setShowModal(true);
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
                      onClick={() => navigate(`/blogs/edit/${blog.id}`, { state: { blog } })}
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
            ))}
          </div>



          {/* No Blogs Message */}
          {blogs?.length === 0 && <div className="text-center text-gray-400 text-xl py-20">No Blogs</div>}

          {/* Pagination */}
          {blogs?.length > upcomingItemsPerPage && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white ">
              <div className="text-sm text-gray-700">
                Showing {upcomingStartIndex + 1} to {Math.min(upcomingEndIndex, blogs.length)} out of {blogs.length} records
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(blogs?.length / upcomingItemsPerPage)}
                  page={upcomingCurrentPage}
                  onChange={handleUpcomingChangePage}
                  color="primary"
                  size="small"
                />
              </Stack>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <CustomModal open={showModal} onClose={() => setShowModal(false)}>
  {/* Title */}
  <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
    Delete Post
  </h2>

  <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

  {/* Message */}
  <p className="text-lg text-center font-light text-[#16151C] mb-12">
    Are you sure you want to permanently delete this post?
  </p>

  {/* Buttons */}
  <div className="flex gap-3 justify-end">
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
        color: "#16151C",
        textTransform: "none",
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={() => deleteBlog(selectedLink?.id)}
      variant="contained"
      sx={{
        width: 166,
        height: 50,
        borderRadius: "10px",
        backgroundColor: "#4071B6",
        fontSize: "20px",
        fontWeight: 300,
        color: "#FFFFFF",
        textTransform: "none",
        "&:hover": { backgroundColor: "#305a91" },
      }}
    >
      Yes
    </Button>
  </div>
</CustomModal>



        {/* Edit Modal (kept intact for other workflow) */}
        <Modal open={showEditModal}>
          <EditBlog item={selectedLink} onClose={() => setShowEditModal(false)} />
        </Modal>
      </div>
    </TopHeadingProvider>
  )
}
