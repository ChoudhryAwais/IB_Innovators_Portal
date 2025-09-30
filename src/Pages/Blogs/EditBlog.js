"use client"

import { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { db, storage } from "../../firebase"
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import { toast } from "react-hot-toast"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import Button from "@mui/material/Button";
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"


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

export default function EditBlog({ item, onClose }) {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Blogs")
    setSecondMessage("Show all Blogs")
  }, [setFirstMessage, setSecondMessage])

  const [url, setUrl] = useState("")
  const [editorContent, setEditorContent] = useState("")
  const [image, setImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [header, setHeader] = useState("")
  const [seoTags, setSeoTags] = useState("")
  const [writtenBy, setWrittenBy] = useState("")
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState([])

  const { id } = useParams()
  const location = useLocation()
  const blogFromState = location.state?.blog

  const [blog, setBlog] = useState(item || blogFromState || null)

  const navigate = useNavigate()

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
    if (id && !blog) {
      // fetch blog by id if not provided
      const fetchBlog = async () => {
        const blogDoc = await getDoc(doc(db, "Blogs", id))
        if (blogDoc.exists()) {
          setBlog({ id: blogDoc.id, ...blogDoc.data() })
        }
      }
      fetchBlog()
    }
  }, [id, blog])

  // Sync states when blog is loaded
  useEffect(() => {
    if (blog) {
      setUrl(blog.url || "")
      setEditorContent(blog.content || "")
      setImage(blog.image || null)
      setHeader(blog.header || "")
      setSeoTags(blog.seoTags || "")
      setWrittenBy(blog.writtenBy || "")
      setDuration(blog.duration || "")
      setDescription(blog.description || "")
      setSelectedTags(blog.selectedTags || [])
    }
  }, [blog])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setImage(URL.createObjectURL(file))
    }
  }

  const handleBlogSubmit = async () => {
    try {
      let imageUrl = ""
      if (selectedFile) {
        const randomString = Math.random().toString(36).substring(7)
        const newFileName = `${randomString}_${selectedFile.name}`
        const storageRef = ref(storage, `blog_images/${newFileName}`)
        const fileArrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = (e) => reject(e)
          reader.readAsArrayBuffer(selectedFile)
        })
        await uploadBytes(storageRef, fileArrayBuffer)
        imageUrl = await getDownloadURL(storageRef)
      }

      if (blog?.id) {
        const blogsRef = doc(db, "Blogs", blog.id)
        await updateDoc(blogsRef, {
          content: editorContent,
          image: imageUrl !== "" ? imageUrl : blog?.image,
          header,
          updatedOn: new Date(),
          seoTags,
          url,
          selectedTags,
          writtenBy,
          duration,
          description,
        })
        toast.success("Blog updated successfully!")
      } else {
        // ---- CREATE MODE ----
        const blogsRef = collection(db, "Blogs")
        await addDoc(blogsRef, {
          content: editorContent,
          image: imageUrl,
          header,
          createdOn: new Date(),
          seoTags,
          url,
          selectedTags,
          writtenBy,
          duration,
          description,
        })
        toast.success("Blog created successfully!")
      }

      // reset fields
      setEditorContent("")
      setImage(null)
      setSelectedFile(null)
      setHeader("")

      onClose ? onClose() : navigate("/blogs")
    } catch (e) {
      console.error(e)
      toast.error("Error saving blog")
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

  return (
    <TopHeadingProvider>

      <div className="p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-6">
          <h1 className="text-[24px] font-semibold text-[#16151C]  mb-6">
            {blog?.id ? "Edit Blog" : "Create a New Blog"}
          </h1>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-[16px] font-light text-[#16151C] mb-2">
              Choose an image for a Blog
            </label>
            <div className="w-[510px] h-[133px] border-2 border-dashed border-[#4071B6] rounded-[10px] p-8 pt-3 text-center hover:border-gray-400 transition-colors relative">
              {image ? (
                <div className="relative inline-block">
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Blog Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <label className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded cursor-pointer text-sm">
                    Change
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer ">
                  <div className="flex items-center justify-center mx-auto mb-2">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="10" fill="#4071B6" />
                      <path d="M24.8125 17.0127C25.0818 16.7968 25.4755 16.8401 25.6914 17.1094C26.6919 18.3575 27.291 19.9434 27.291 21.667C27.2909 25.6939 24.026 28.958 19.999 28.958C15.972 28.958 12.7072 25.6939 12.707 21.667C12.707 19.9434 13.3062 18.3575 14.3066 17.1094C14.5225 16.8401 14.9162 16.7968 15.1855 17.0127C15.4546 17.2286 15.4979 17.6214 15.2822 17.8906C14.453 18.9251 13.957 20.2376 13.957 21.667C13.9572 25.0036 16.6624 27.708 19.999 27.708C23.3356 27.708 26.0409 25.0036 26.041 21.667C26.041 20.2376 25.5451 18.9251 24.7158 17.8906C24.5002 17.6214 24.5434 17.2286 24.8125 17.0127ZM19.999 11.042C20.1648 11.042 20.3242 11.1074 20.4414 11.2246L23.7744 14.5576C24.0185 14.8017 24.0185 15.1983 23.7744 15.4424C23.5304 15.6862 23.1347 15.6861 22.8906 15.4424L20.624 13.1758V23.333C20.624 23.6782 20.3442 23.958 19.999 23.958C19.6538 23.958 19.374 23.6782 19.374 23.333V13.1758L17.1074 15.4424C16.8634 15.6861 16.4676 15.6862 16.2236 15.4424C15.9796 15.1983 15.9796 14.8017 16.2236 14.5576L19.5566 11.2246C19.6739 11.1074 19.8333 11.042 19.999 11.042Z" fill="white" />
                    </svg>
                  </div>
                  <p className="text-[#16151C] text-[14px] font-light mb-2">
                    Drag & Drop or <span className="text-[#4071B6]">choose image</span> to upload
                  </p>
                  <p className="text-[11px] font-light text-[#A2A1A8]">Supported formats: Jpeg, png</p>
                  <input type="file" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Blog URL */}
          <div className="mb-6">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">
              Blog URL (without spacing, separate with "-"):
            </label>
            <input
              value={url}
              type="text"
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="revise-to-thrive"
            />
          </div>

          {/* Tags Selection */}
          <div className="mb-6">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Select Tags</label>
            <div className="relative">
              <select
                onChange={handleSelectChange}
                className="w-full h-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                value=""
              >
                <option value="">Select</option>
                {tags.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {item}
                    <button onClick={() => handleDelete(item)} className="ml-2 text-blue-600 hover:text-blue-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Written By and Reading Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Written By</label>
              <input
                value={writtenBy}
                type="text"
                onChange={(e) => setWrittenBy(e.target.value)}
                className="w-full h-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Reading Duration</label>
              <input
                value={duration}
                type="text"
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Minutes"
              />
            </div>
          </div>

          {/* SEO Tags */}
          <div className="mb-6">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Blog SEO Tags</label>
            <textarea
              value={seoTags}
              onChange={(e) => setSeoTags(e.target.value)}
              rows={4}
              className="w-full h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter seo Tags"
            />
          </div>

          {/* Blog Header */}
          <div className="mb-6">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Blog Header (50 - 60 characters)</label>
            <input
              value={header}
              type="text"
              onChange={(e) => setHeader(e.target.value)}
              minLength={50}
              maxLength={60}
              className="w-full h-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter blog header"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{header?.length || 0}/60</div>
          </div>

          {/* Blog Description */}
          <div className="mb-6">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">
              Blog Description (70 - 160 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={70}
              maxLength={160}
              rows={3}
              className="w-full h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter blog description"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{description?.length || 0}/160</div>
          </div>

          {/* Blog Summary */}
          <div className="mb-8">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-2">Blog Summary</label>
            <div className="rounded-lg overflow-hidden">
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                className="bg-white"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              onClick={() => (onClose ? onClose() : navigate("/blogs"))}
              sx={{
                width: 166,
                height: 50,
                borderRadius: "0.5rem",
                px: 3,
                py: 1,
                textTransform: "none",
                borderColor: "grey.400",
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "grey.100",
                  borderColor: "grey.400",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleBlogSubmit}
              sx={{
                width: 166,
                height: 50,
                borderRadius: "0.5rem",
                px: 3,
                py: 1,
                fontweight: 600,
                textTransform: "none",
                backgroundColor: "#4071B6",
                "&:hover": {
                  backgroundColor: "#305a91",
                },
              }}
            >
              Publish
            </Button>
          </div>

        </div>

      </div>
    </TopHeadingProvider>

  )
}
