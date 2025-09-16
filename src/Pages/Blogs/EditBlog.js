"use client"

import { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { db, storage } from "../../firebase"
import { doc, updateDoc } from "firebase/firestore"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import { toast } from "react-hot-toast"
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

export default function EditBlog({ item, onClose }) {
  const [url, setUrl] = useState(item?.url || "")
  const [editorContent, setEditorContent] = useState(item?.content || "")
  const [image, setImage] = useState(item?.image || null)
  const [selectedFile, setSelectedFile] = useState(item?.selectedFile || null)
  const [header, setHeader] = useState(item?.header || "")
  const [seoTags, setSeoTags] = useState(item?.seoTags || "")
  const [writtenBy, setWrittenBy] = useState(item?.writtenBy || "")
  const [duration, setDuration] = useState(item?.duration || "")
  const [description, setDescription] = useState(item?.description || "")
  const [selectedTags, setSelectedTags] = useState(item?.selectedTags || [])

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

      const blogsRef = doc(db, "Blogs", item?.id)
      await updateDoc(blogsRef, {
        content: editorContent,
        image: imageUrl !== "" ? imageUrl : item?.image,
        header,
        updatedOn: new Date(),
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
      toast.success("Blog updated successfully!")
      onClose && onClose()
    } catch (e) {
      console.error(e)
      toast.error("Error updating blog")
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Blog</h1>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose an image for a Blog
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative">
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
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Drag & Drop or <span className="text-blue-600 underline">choose image</span>
                  </p>
                  <p className="text-sm text-gray-400">Supported formats: JPEG, PNG</p>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Blog URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog URL (without spacing, separate with "-"):
            </label>
            <input
              value={url}
              type="text"
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="revise-to-thrive"
            />
          </div>

          {/* Tags Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tags</label>
            <div className="relative">
              <select
                onChange={handleSelectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Written By</label>
              <input
                value={writtenBy}
                type="text"
                onChange={(e) => setWrittenBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Jhon Deo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reading Duration</label>
              <input
                value={duration}
                type="text"
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Minutes"
              />
            </div>
          </div>

          {/* SEO Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog SEO Tags</label>
            <textarea
              value={seoTags}
              onChange={(e) => setSeoTags(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter seo Tags"
            />
          </div>

          {/* Blog Header */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Header (50 - 60 characters)</label>
            <input
              value={header}
              type="text"
              onChange={(e) => setHeader(e.target.value)}
              minLength={50}
              maxLength={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter blog header"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{header?.length || 0}/60</div>
          </div>

          {/* Blog Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Description (70 - 160 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={70}
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter blog description"
            />
            <div className="text-right text-sm text-gray-500 mt-1">{description?.length || 0}/160</div>
          </div>

          {/* Blog Body */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Body</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
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
            <button
              onClick={() => navigate("/blogs")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={handleBlogSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
