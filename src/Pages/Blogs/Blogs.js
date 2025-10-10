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
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

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

  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <TopHeadingProvider>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-[20px] md:text-[24px] font-semibold text-[#16151C]">Existing Blogs</h1>
            <Button
              variant="contained"
              onClick={() => navigate("/blogs/new")}
              sx={{
                backgroundColor: "#4071B6",
                width: { xs: "100%", md: "250px" },
                height: { xs: "44px", md: "50px" },
                "&:hover": { backgroundColor: "#427ac9ff" },
                color: "white",
                px: 3,
                py: 1.5,
                borderRadius: "0.5rem",
                fontWeight: 600,
                textTransform: "none",
                fontSize: { xs: "14px", md: "16px" },
              }}
            >
              + Create a new Blog
            </Button>
          </div>

          {/* Blog Cards */}
          <div className="space-y-4 md:space-y-6">
            {upcomingDisplayedSessions.map((blog) => (
              <div
                key={blog.id}
                className="rounded-lg pb-4 flex flex-col md:flex-row gap-4 items-stretch relative border-b border-gray-200"
              >
                {/* Left Section: Author + Blog Content */}
                <div className="flex-1 flex flex-col md:flex-row items-start pb-4 md:pb-5 pr-0 md:pr-4">
                  <div className="flex-1 min-w-0 mb-4 md:mb-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-[#4071B6] rounded-full flex items-center justify-center overflow-hidden">
                        {blog?.authorImage ? (
                          <img
                            src={blog.authorImage}
                            alt={blog?.writtenBy || "Author"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-white text-xs md:text-sm"
                          />
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-1">
                        <p className="text-[12px] md:text-[14px] font-light text-[#16151C]">
                          {blog.writtenBy || "Admin"}
                        </p>
                        <p className="text-[12px] md:text-[14px] font-light text-[#757575]">
                          - {blog.createdOn
                            ? `${Math.floor(
                              (new Date() - blog.createdOn.toDate()) / (1000 * 60 * 60 * 24)
                            )} days ago`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Blog Title */}
                    <h3 className="text-[16px] md:text-[18px] font-light text-[#16151C] mb-2">
                      {blog.header}
                    </h3>

                    {/* Blog Content */}
                    <p className="text-[#16151C] text-[14px] md:text-[16px] font-light leading-relaxed line-clamp-2 md:line-clamp-3">
                      {blog.description || "N/A"}
                    </p>
                  </div>

                  {/* Blog Image */}
                  <div className="w-full md:w-[140px] h-32 md:h-[139px] bg-black rounded-lg overflow-hidden md:ml-4">
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
                            className="w-6 h-6 md:w-8 md:h-8"
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

                {/* Right Section: Buttons */}
                <div className="flex flex-col justify-end">
                  <div className="flex gap-2 md:gap-3 justify-start md:justify-end">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedLink(blog);
                        setShowModal(true);
                      }}
                      sx={{
                        borderRadius: "8px",
                        width: { xs: "100px", md: "118px" },
                        height: { xs: "32px", md: "36px" },
                        color: "#A81E1E",
                        backgroundColor: "#A81E1E0D",
                        borderColor: "#A81E1E",
                        fontSize: { xs: "10px", md: "11.36px" },
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
                        width: { xs: "100px", md: "118px" },
                        height: { xs: "32px", md: "36px" },
                        color: "#4071B6",
                        backgroundColor: "#4071B60D",
                        borderColor: "#4071B6",
                        fontSize: { xs: "10px", md: "11.36px" },
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
          {blogs?.length === 0 && <div className="text-center text-gray-400 text-lg md:text-xl py-16 md:py-20">No Blogs</div>}

          {/* Pagination */}
          {blogs?.length > upcomingItemsPerPage && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-center gap-4 px-4 py-3 bg-white">

              {/* Pagination buttons */}
              <Stack direction="row" spacing={1} alignItems="center" className="justify-center md:justify-end">
                {/* Previous button */}
                <Button
                  disabled={upcomingCurrentPage === 1}
                  onClick={() => setUpcomingCurrentPage(upcomingCurrentPage - 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>

                {/* Page numbers */}
                {getVisiblePages(
                  upcomingCurrentPage,
                  Math.ceil(blogs.length / upcomingItemsPerPage),
                  4
                ).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setUpcomingCurrentPage(page)}
                    sx={{
                      width: page === upcomingCurrentPage ? 35 : 32,
                      minWidth: 'unset',
                      height: 36,
                      borderRadius: page === upcomingCurrentPage ? '8px' : '50px',
                      padding: '7px 12px',
                      gap: '10px',
                      borderWidth: page === upcomingCurrentPage ? 1 : 0,
                      border: page === upcomingCurrentPage ? '1px solid #4071B6' : 'none',
                      background: '#FFFFFF',
                      color: page === upcomingCurrentPage ? '#4071B6' : '#16151C',
                      fontWeight: page === upcomingCurrentPage ? 600 : 300,
                      fontSize: '14px',
                    }}
                  >
                    {page}
                  </Button>
                ))}

                {/* Next button */}
                <Button
                  disabled={upcomingCurrentPage === Math.ceil(blogs.length / upcomingItemsPerPage)}
                  onClick={() => setUpcomingCurrentPage(upcomingCurrentPage + 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>
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
