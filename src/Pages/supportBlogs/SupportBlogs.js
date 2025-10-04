"use client"

import { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { db } from "../../firebase"
import { collection, doc, deleteDoc, query, onSnapshot, updateDoc } from "firebase/firestore"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"
import { useNavigate } from "react-router-dom"

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import toast from "react-hot-toast";
import { TextField } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import Box from "@mui/material/Box";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider"
import CustomModal from "../../Components/CustomModal/CustomModal";
import Stack from "@mui/material/Stack"

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

export default function SupportBlogs() {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Support Blogs")
    setSecondMessage("Show Support Blogs")
  }, [setFirstMessage, setSecondMessage])

  const [blogs, setBlogs] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [categories, setCategories] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState({})
  const [loading, setLoading] = useState(false)

  const [editorContent, setEditorContent] = useState("")
  const [viewers, setViewers] = useState("")
  const [header, setHeader] = useState("")
  const [subCategory, setSubCategory] = useState("")

  const navigate = useNavigate()

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog)
    setEditorContent(blog.content)
    setViewers(blog.viewers)
    setHeader(blog.header)
    setSubCategory(blog.subCategory)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (viewers && header && editorContent && subCategory) {
      setLoading(true)
      const blogRef = doc(db, "SupportBlogs", selectedBlog.id)
      await updateDoc(blogRef, {
        content: editorContent,
        viewers,
        header,
        subCategory,
        updatedOn: new Date(),
      })
      setShowEditModal(false)
      setEditorContent("")
      setViewers("")
      setHeader("")
      setSubCategory("")
      setLoading(false)
    } else {
      console.log("Please fill all details")
      setLoading(false)
    }
  }

  const deleteBlog = async (id) => {
    setLoading(true)
    await deleteDoc(doc(db, "SupportBlogs", id))
    setBlogs(blogs.filter((blog) => blog.id !== id))
    setShowModal(false)
    setLoading(false)
  }

  useEffect(() => {
    const q = query(collection(db, "SupportBlogs"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsArray = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      setBlogs(blogsArray)

      const subCategorySet = new Set()
      const categorySet = new Set()
      snapshot.docs.forEach((doc) => {
        const subCategory = doc.data().subCategory
        const category = doc.data().viewers
        if (subCategory) subCategorySet.add(subCategory)
        if (category) categorySet.add(category)
      })

      setSubCategories(Array.from(subCategorySet))
      setCategories(Array.from(categorySet))
    })

    return () => unsubscribe()
  }, [])

  const upcomingItemsPerPage = 5
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1)

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage)
  }

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
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-4 md:p-6">

          {/* Header section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-[20px] md:text-[24px] font-semibold text-[#16151C] text-center md:text-left">Support & Training Blogs</h1>
            <Button
              variant="contained"
              onClick={() => navigate("/supportBlogs/new")}
              sx={{
                backgroundColor: "#4071B6",
                width: { xs: "100%", md: "250px" },
                height: { xs: "44px", md: "50px" },
                "&:hover": { backgroundColor: "#427ac9ff" },
                color: "white",
                px: 0,
                py: 1.5,
                borderRadius: "0.5rem",
                fontWeight: 600,
                textTransform: "none",
                fontSize: { xs: "14px", md: "16px" },
              }}
            >
              + Create a new Training Blog
            </Button>
          </div>

          {/* Blog entries */}
          <div className="space-y-4 md:space-y-6">
            {upcomingDisplayedSessions.map((blog, index) => (
              <div key={index} className="bg-white pb-4 border-b border-[#A2A1A833]">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  {/* Left: Content */}
                  <div className="flex-1 md:pr-6">
                    <h3 className="text-[16px] md:text-[18px] font-light text-[#16151C] mb-2">
                      {blog.header}
                    </h3>
                    <div
                      className="text-[#16151C] text-[14px] md:text-[16px] font-light leading-relaxed line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: blog?.content?.slice(0, 200) + "...",
                      }}
                    />
                  </div>

                  {/* Right: Buttons aligned bottom */}
                  <div className="flex flex-col justify-end">
                    <div className="flex gap-2 md:gap-3 justify-start md:justify-end">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSelectedBlog(blog);
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
                        onClick={() => navigate(`/supportBlogs/edit/${blog.id}`, { state: { blog } })}
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
              </div>
            ))}

            {blogs?.length === 0 && (
              <div className="text-center text-gray-400 text-lg md:text-xl py-8 md:py-12">No Blogs</div>
            )}
          </div>

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
   
          {/* Delete Confirmation Modal */}
          <CustomModal open={showModal} onClose={() => setShowModal(false)}>
            <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
              Delete Post
            </h2>

            <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

            <p className="text-lg text-center font-light text-[#16151C] mb-12">
              Are you sure you want to permanently delete this post?
            </p>

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
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "10px",
                  backgroundColor: "#4071B6",
                  fontSize: "20px",
                  fontWeight: 300,
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#305a91" },
                }}
                onClick={() => deleteBlog(selectedBlog?.id)}
              >
                {loading ? "Deleting..." : "Yes"}
              </Button>
            </div>
          </CustomModal>



          {/* Edit Blog Modal */}
          <Dialog
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            PaperProps={{
              sx: {
                borderRadius: "12px",
                padding: "24px",
                width: "500px",
                maxWidth: "95%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              },
            }}
            BackdropProps={{
              sx: {
                backgroundColor: "rgba(0,0,0,0.5)",
              },
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", textAlign: "center", marginBottom: "16px" }}>
              Edit Blog
            </h2>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select category</InputLabel>
              <Select value={viewers} onChange={(e) => setViewers(e.target.value)}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
                <MenuItem value="Teacher">Teacher</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <TextField
              value={header}
              type="text"
              label="Blog Header"
              onChange={(e) => setHeader(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              value={subCategory}
              label="Subcategory"
              onChange={(e) => setSubCategory(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontWeight: "500" }}>Blog Body:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  minHeight: "120px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
              />
            </div>

            <DialogActions sx={{ justifyContent: "flex-end", gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowEditModal(false)}
                sx={{
                  borderColor: "#d1d5db",
                  color: "#374151",
                  "&:hover": { backgroundColor: "#f9fafb" },
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                onClick={handleSaveEdit}
                sx={{
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                }}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
