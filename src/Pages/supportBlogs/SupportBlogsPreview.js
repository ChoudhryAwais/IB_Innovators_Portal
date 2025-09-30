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

export default function SupportBlogsPreview() {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Support Blogs Preview")
    setSecondMessage("Show all Support Blogs")
  }, [setFirstMessage, setSecondMessage])

  const [blogs, setBlogs] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [categories, setCategories] = useState([])

  const [editorContent, setEditorContent] = useState("")
  const [viewers, setViewers] = useState("")
  const [header, setHeader] = useState("")
  const [subCategory, setSubCategory] = useState("")

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
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[24px] font-semibold text-[#16151C]">
              Support Blogs Preview
            </h1>
          </div>

          {/* Blog Cards */}
          <div className="space-y-6">
            {upcomingDisplayedSessions.map((blog) => (
              <div
                key={blog.id}
                className="pb-4 flex gap-4 items-stretch relative border-b border-gray-200"
              >
                {/* Left Section: Author + Blog Content */}
                <div className="flex-1 flex items-start pb-5 pr-4">
                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {blog.writtenBy
                            ? blog.writtenBy.charAt(0).toUpperCase()
                            : "A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[14px] font-light text-[#16151C]">
                          {blog.writtenBy || "N/A"}
                        </p>
                        <p className="text-[14px] font-light text-[#757575]">
                          - {blog.createdOn
                            ? `${Math.floor(
                              (new Date() - blog.createdOn.toDate()) / (1000 * 60 * 60 * 24)
                            )} days ago`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Blog Title */}
                    <h3 className="text-[18px] font-light text-[#16151C] mb-2">
                      {blog.header}
                    </h3>

                    {/* Blog Content */}
                    <p className="text-[#16151C] text-[16px] font-light leading-relaxed">
                      {blog?.content ? (
                        <div
                          className="text-[#16151C] font-light text-[16px] leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: blog.content.slice(0, 200) + "...",
                          }}
                        />
                      ) : (
                        <p className="text-[#16151C] font-base leading-relaxed">No content available</p>
                      )}
                    </p>
                  </div>

                  {/* Blog Image */}
                  <div className="w-[200px] h-full bg-black rounded-lg overflow-hidden ml-4">
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
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 
                              002 2h12a2 2 0 002-2V5a2 2 0 
                              00-2-2H4zm12 12H4l4-8 3 6 
                              2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Blogs Message */}
          {blogs?.length === 0 && (
            <div className="text-center text-gray-400 text-xl py-20">
              No Blogs
            </div>
          )}
        </div>
      </div>
    </TopHeadingProvider>
  )

}
