"use client"

import { useState, useEffect } from "react"
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db } from "../../firebase"
import toast from "react-hot-toast"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { doc, getDoc, addDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { TextField, MenuItem } from "@mui/material";
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

export default function CreateSupportBlog() {

  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Support Blogs")
    setSecondMessage("Show Support Blogs")
  }, [setFirstMessage, setSecondMessage])


  const [editorContent, setEditorContent] = useState("")
  const [viewers, setViewers] = useState("")
  const [header, setHeader] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const { id } = useParams()
  const location = useLocation()
  const blogFromState = location.state?.blog
  const [blog, setBlog] = useState(blogFromState || null)

  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      const q = collection(db, "SupportBlogs");
      const snapshot = await getDocs(q);

      const subCategorySet = new Set();
      const categorySet = new Set();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.subCategory) subCategorySet.add(data.subCategory);
        if (data.viewers) categorySet.add(data.viewers);
      });

      setSubCategories(Array.from(subCategorySet));
      setCategories(Array.from(categorySet));
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      if (id && !blog) {
        const blogDoc = await getDoc(doc(db, "SupportBlogs", id))
        if (blogDoc.exists()) {
          setBlog({ id: blogDoc.id, ...blogDoc.data() })
        }
      }
    }
    fetchBlog()
  }, [id, blog])

  useEffect(() => {
    if (blog) {
      setHeader(blog.header || "")
      setEditorContent(blog.content || "")
      setViewers(blog.viewers || "")
      setSubCategory(blog.subCategory || "")
    }
  }, [blog])

  const handleBlogSubmit = async () => {
    if (viewers && header && editorContent && subCategory) {
      setLoading(true)
      try {
        if (blog?.id) {
          // ---- EDIT MODE ----
          const blogRef = doc(db, "SupportBlogs", blog.id)
          await updateDoc(blogRef, {
            content: editorContent,
            viewers,
            header,
            subCategory,
            updatedOn: new Date(),
          })
          toast.success("Blog updated successfully!")
        } else {
          // ---- CREATE MODE ----
          const blogsRef = collection(db, "SupportBlogs")
          await addDoc(blogsRef, {
            content: editorContent,
            viewers,
            header,
            subCategory,
            createdOn: new Date(),
          })
          toast.success("Blog submitted successfully!")
        }

        // reset and redirect
        setEditorContent("")
        setViewers("")
        setHeader("")
        setSubCategory("")
        navigate("/supportBlogs")
      } catch (err) {
        console.error(err)
        toast.error("Error saving blog")
      }
      setLoading(false)
    } else {
      toast.error("Please fill all details")
    }
  }

  return (
    <TopHeadingProvider>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Title changes based on create/edit */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {blog?.id ? "Edit Blog" : "Create a new Blog"}
          </h1>

          <div className="space-y-6">
            {/* Select Category */}
            <Autocomplete
              freeSolo
              options={categories}
              value={viewers}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setViewers(newValue); // typed value
                } else if (newValue) {
                  setViewers(newValue);
                } else {
                  setViewers("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Category"
                  fullWidth
                  sx={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "0.5rem",
                  }}
                />
              )}
            />

            {/*  Subcategory */}
            <Autocomplete
              freeSolo
              options={subCategories}
              value={subCategory}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setSubCategory(newValue); // typed value
                } else if (newValue) {
                  setSubCategory(newValue);
                } else {
                  setSubCategory("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Subcategory"
                  fullWidth
                  sx={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "0.5rem",
                  }}
                />
              )}
            />

            {/* Blog Header */}
            {/* <TextField
              value={header}
              onChange={(e) => setHeader(e.target.value)}
              label="Blog Header"
              fullWidth
            /> */}

            {/* Blog Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Body
              </label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                style={{
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                  minHeight: "200px",
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outlined"
              onClick={() => navigate("/supportBlogs")}
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
              disabled={loading}
              onClick={handleBlogSubmit}
              sx={{
                width: 166,
                height: 50,
                borderRadius: "0.5rem",
                px: 3,
                py: 1,
                textTransform: "none",
                backgroundColor: "#4071B6",
                "&:hover": {
                  backgroundColor: "#1e40af",
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                  backgroundColor: "#6a93ccd2",
                  color: "white",
                },
              }}
            >
              {loading
                ? blog?.id
                  ? "Saving..."
                  : "Publishing..."
                : blog?.id
                  ? "Save Changes"
                  : "Publish"}
            </Button>
          </div>

        </div>
      </div>
    </TopHeadingProvider>
  )
}
