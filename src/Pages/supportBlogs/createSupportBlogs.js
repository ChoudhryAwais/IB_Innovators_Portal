"use client"

import { useState, useEffect } from "react"
import "react-quill/dist/quill.snow.css"
import { db } from "../../firebase"
import { collection, addDoc } from "firebase/firestore"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

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

export default function CreateSupportBlog() {
  const [editorContent, setEditorContent] = useState("")
  const [viewers, setViewers] = useState("")
  const [header, setHeader] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchExistingBlogs = async () => {
      const blogsRef = collection(db, "SupportBlogs")
      const snapshot = await blogsRef.get?.()
      setCategories([])
      setSubCategories([])
    }
    fetchExistingBlogs()
  }, [])

  const handleBlogSubmit = async () => {
    if (viewers && header && editorContent && subCategory) {
      setLoading(true)
      try {
        const blogsRef = collection(db, "SupportBlogs")
        await addDoc(blogsRef, {
          content: editorContent,
          viewers,
          header,
          subCategory,
          createdOn: new Date(),
        })
        toast.success("Blog submitted successfully!")
        setEditorContent("")
        setViewers("")
        setHeader("")
        setSubCategory("")
      } catch (err) {
        console.error(err)
        toast.error("Error submitting blog")
      }
      setLoading(false)
    } else {
      toast.error("Please fill all details")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create a new Blogs</h1>

        <div className="space-y-6">
          {/* Select Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
            <select
              value={viewers}
              onChange={(e) => setViewers(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Tutor Support Centre</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Select Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subcategory</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Using the portal</option>
              <option value="Getting Started">Getting Started</option>
              <option value="Advanced Features">Advanced Features</option>
              <option value="Troubleshooting">Troubleshooting</option>
            </select>
          </div>

          {/* Blog Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Summary</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Custom toolbar to match design */}
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center gap-2">
                <select className="text-sm border-none bg-transparent">
                  <option>Normal</option>
                </select>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <strong>B</strong>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <em>I</em>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <u>U</u>
                  </button>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded text-sm">A</button>
                <select className="text-sm border-none bg-transparent">
                  <option>Sans Serif</option>
                </select>
                <button className="p-1 hover:bg-gray-200 rounded">≡</button>
                <select className="text-sm border-none bg-transparent">
                  <option>Normal</option>
                </select>
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Enter blog summary"
                className="w-full h-32 p-3 border-none resize-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => navigate("/supportBlogs")}
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleBlogSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  )
}
