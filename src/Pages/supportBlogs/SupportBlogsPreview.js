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
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

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
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-[20px] md:text-[24px] font-semibold text-[#16151C]">
              Support Blogs Preview
            </h1>
          </div>

          {/* Blog Cards */}
          <div className="space-y-4 md:space-y-6">
            {upcomingDisplayedSessions.map((blog) => (
              <div
                key={blog.id}
                className="pb-4 flex flex-col md:flex-row gap-4 items-stretch relative border-b border-gray-200"
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
                          {blog.writtenBy || "N/A"}
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
                    <div className="text-[#16151C] text-[14px] md:text-[16px] font-light leading-relaxed">
                      {blog?.content ? (
                        <div
                          className="text-[#16151C] font-light text-[14px] md:text-[16px] leading-relaxed line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: blog.content.slice(0, 200) + "...",
                          }}
                        />
                      ) : (
                        <p className="text-[#16151C] font-base leading-relaxed">No content available</p>
                      )}
                    </div>
                  </div>

                  {/* Blog Image */}
                  <div className="w-full md:w-[200px] h-48 md:h-full bg-black rounded-lg overflow-hidden md:ml-4">
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
            <div className="text-center text-gray-400 text-lg md:text-xl py-16 md:py-20">
              No Blogs
            </div>
          )}

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
      </div>
    </TopHeadingProvider>
  )
}