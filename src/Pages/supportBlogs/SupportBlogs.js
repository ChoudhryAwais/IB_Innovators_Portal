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
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Support & Training Blogs</h1>
          <button
            onClick={() => navigate("/supportBlogs/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            + Create a new Training Blog
          </button>
        </div>

        {/* Blog entries */}
        <div className="space-y-6">
          {upcomingDisplayedSessions.map((blog, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.header}</h3>
                  <div
                    className="text-gray-600 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: blog?.content?.slice(0, 200) + "...",
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedBlog(blog)
                      setShowModal(true)
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {blogs?.length === 0 && <div className="text-center text-gray-400 text-xl py-12">No Blogs</div>}
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
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              padding: "24px",
              width: "400px",
              maxWidth: "90%",
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
            Delete
          </h2>
          <p style={{ textAlign: "center", color: "#374151", marginBottom: "24px" }}>
            Are you sure you want to Delete this Post?
          </p>
          <DialogActions sx={{ justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setShowModal(false)}
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
              onClick={() => deleteBlog(selectedBlog?.id)}
              sx={{
                backgroundColor: "#2563eb",
                "&:hover": { backgroundColor: "#1d4ed8" },
              }}
            >
              {loading ? "Deleting..." : "Yes"}
            </Button>
          </DialogActions>
        </Dialog>


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
    </TopHeadingProvider>
  )
}
