import React, { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { db, storage } from "../../firebase"
import { collection, doc, addDoc, deleteDoc, query, onSnapshot } from "firebase/firestore"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import { Modal, TextField } from "@mui/material"
import EditBlog from "./EditBlog"
import { toast } from "react-hot-toast"
import { Chip, FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material"

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
      <div className="flex flex-wrap gap-3 mr-2 mb-5">
        {/* Existing Blogs */}
        <div className="flex-1 shadow-lg bg-white/50 backdrop-blur-sm p-4 rounded-lg mb-3">
          <h2 className="text-left font-semibold text-lg mb-4">Existing Blogs</h2>
          <Button variant="contained" color="primary" onClick={() => navigate("/blogs/new")}>
          Create New Blog
        </Button>
          {upcomingDisplayedSessions.map((blog, index) => (
            <div
              key={blog.id}
              className={`flex justify-between items-center p-4 ${
                index !== 0 ? "border-t border-gray-300" : ""
              }`}
            >
              <div className="flex flex-1 items-center">
                <p className="text-lg font-medium">{blog.header}</p>
              </div>
              <div className="flex flex-col gap-2 w-32">
                <Button
                  // onClick={() => {
                  //   setSelectedLink(blog)
                  //   setShowEditModal(true)
                  // }}
                  onClick={() => navigate("/blogs/new")}
                  variant="outlined"
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setSelectedLink(blog)
                    setShowModal(true)
                  }}
                  variant="outlined"
                  color="error"
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {blogs?.length === 0 && (
            <div className="text-center text-gray-400 text-xl py-10">
              No Blogs
            </div>
          )}
          {blogs?.length > upcomingItemsPerPage && (
            <div className="flex items-center justify-center mt-4">
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
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>
            {"Please confirm if you want to delete this blog?"}
          </DialogTitle>
          <DialogActions>
            <Button
              className="!text-red-700 !text-lg"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button className="!text-lg" onClick={() => deleteBlog(selectedLink?.id)}>
              Delete
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
