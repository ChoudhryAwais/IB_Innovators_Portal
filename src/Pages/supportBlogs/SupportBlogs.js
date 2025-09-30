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

  return (
    <TopHeadingProvider>
      <div className="p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-6">

          {/* Header section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[24px] font-semibold text-[#16151C]">Support & Training Blogs</h1>
            <Button
              variant="contained"
              onClick={() => navigate("/supportBlogs/new")}
              sx={{
                backgroundColor: "#4071B6",
                width: "250px",
                height: "50px",
                "&:hover": { backgroundColor: "#427ac9ff" },
                color: "white",
                px: 0,
                py: 1.5,
                borderRadius: "0.5rem",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              + Create a new Training Blog
            </Button>
          </div>

          {/* Blog entries */}
          <div className="space-y-6 ">
            {upcomingDisplayedSessions.map((blog, index) => (
              <div key={index} className="bg-white pb-4 border-b border-[#A2A1A833] ">
                <div className="flex justify-between">
                  {/* Left: Content */}
                  <div className="flex-1 pr-6">
                    <h3 className="text-[18px] font-light text-[#16151C] mb-2">
                      {blog.header}
                    </h3>
                    <div
                      className="text-[#16151C] text-[16px] font-light leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: blog?.content?.slice(0, 200) + "...",
                      }}
                    />
                  </div>

                  {/* Right: Buttons aligned bottom */}
                  <div className="flex flex-col justify-end">
                    <div className="flex gap-3">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setSelectedBlog(blog);
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
                        onClick={() => navigate(`/supportBlogs/edit/${blog.id}`, { state: { blog } })}
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

            {blogs?.length === 0 && (
              <div className="text-center text-gray-400 text-xl py-12">No Blogs</div>
            )}
          </div>


          {/* Pagination */}
          {blogs?.length > upcomingItemsPerPage && (
            <div className="flex justify-center items-center mt-8">
              <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
                <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">Pagination</h2>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteBlog(selectedBlog?.id)}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Yes"}
                  </button>
                </div>
              </div>
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
