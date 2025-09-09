import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db } from "../../firebase";
import {
  collection,
  doc,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

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

import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

import Box from "@mui/material/Box";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom"

const filter = createFilterOptions();

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ color: ["red", "blue", "green", "black", "gray"] }],
    [{ font: [] }],
    [{ align: [] }],
    [{ size: ["small", false, "large", "huge"] }],
  ],
};

const formats = ["header", "bold", "italic", "underline", "color", "font", "align", "size"];

export default function SupportBlogs() {

    const { setFirstMessage, setSecondMessage } = useTopHeading()
    
      useEffect(() => {
        setFirstMessage("Support Blogs")
        setSecondMessage("Show Support Blogs")
      }, [setFirstMessage, setSecondMessage])

  const [blogs, setBlogs] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState({});
  const [loading, setLoading] = useState(false);

  const [editorContent, setEditorContent] = useState("");
  const [viewers, setViewers] = useState("");
  const [header, setHeader] = useState("");
  const [subCategory, setSubCategory] = useState("");

    const navigate = useNavigate()

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setEditorContent(blog.content);
    setViewers(blog.viewers);
    setHeader(blog.header);
    setSubCategory(blog.subCategory);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (viewers && header && editorContent && subCategory) {
      setLoading(true);
      const blogRef = doc(db, "SupportBlogs", selectedBlog.id);
      await updateDoc(blogRef, {
        content: editorContent,
        viewers,
        header,
        subCategory,
        updatedOn: new Date(),
      });
      setShowEditModal(false);
      setEditorContent("");
      setViewers("");
      setHeader("");
      setSubCategory("");
      toast.success("Blog updated successfully!");
      setLoading(false);
    } else {
      toast("Please fill all details");
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    setLoading(true);
    await deleteDoc(doc(db, "SupportBlogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
    setShowModal(false);
    setLoading(false);
  };

  useEffect(() => {
    const q = query(collection(db, "SupportBlogs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsArray = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setBlogs(blogsArray);

      const subCategorySet = new Set();
      const categorySet = new Set();
      snapshot.docs.forEach((doc) => {
        const subCategory = doc.data().subCategory;
        const category = doc.data().viewers;
        if (subCategory) subCategorySet.add(subCategory);
        if (category) categorySet.add(category);
      });

      setSubCategories(Array.from(subCategorySet));
      setCategories(Array.from(categorySet));
    });

    return () => unsubscribe();
  }, []);

  const upcomingItemsPerPage = 5;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
  const upcomingDisplayedSessions = blogs?.slice(upcomingStartIndex, upcomingEndIndex);

  return (
    <TopHeadingProvider>

      <div className="flex flex-wrap gap-2 mr-2 mb-5 pt-0">
        <div className="flex-1 shadow-lg bg-white/50 backdrop-blur-md rounded-lg p-3 mb-2">

        <Button
          variant="contained"
          color="primary"
          className="mb-4"
          onClick={() => navigate("/supportBlogs/new")}
        >
          Create a New Training Blog
        </Button>

          <h2 className="text-left font-semibold mb-3">Existing Blogs</h2>

          {upcomingDisplayedSessions.map((blog, index) => (
            <div
              key={index}
              className={`flex flex-row justify-between items-center gap-2 p-2 ${
                index !== 0 ? "border-t border-gray-300" : ""
              }`}
            >
              <div className="flex-3 flex flex-col text-lg">
                <div>{blog.header}</div>
                <div
                  className="text-base"
                  dangerouslySetInnerHTML={{
                    __html: blog?.content?.slice(0, 50),
                  }}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Button variant="outlined" className="w-full" onClick={() => handleEditBlog(blog)}>
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  className="w-full"
                  onClick={() => {
                    setSelectedBlog(blog);
                    setShowModal(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {blogs?.length === 0 && (
            <div className="flex-1 text-center text-gray-400 text-xl">No Blogs</div>
          )}

          {blogs?.length > upcomingItemsPerPage && (
            <div className="flex justify-center items-center mt-3">
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

        {/* Delete Confirmation Modal */}
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>{"Please confirm if you want to delete this blog?"}</DialogTitle>
          <DialogActions>
            <Button variant="outlined" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button disabled={loading} variant="contained" color="error" onClick={() => deleteBlog(selectedBlog?.id)}>
              {loading ? "Deleting" : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Blog Modal */}
        <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
          <DialogTitle>Edit Blog</DialogTitle>
          <div className="p-5">
            <FormControl fullWidth className="mb-4">
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
              className="w-full mb-4"
            />

            <Autocomplete
              value={subCategory}
              className="mb-4"
              onChange={(event, newValue) => {
                if (typeof newValue === "string") setSubCategory(newValue);
                else if (newValue?.inputValue) setSubCategory(newValue.inputValue);
                else setSubCategory(newValue);
              }}
              filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(params.inputValue.toLowerCase())
                );
                if (params.inputValue && !options.includes(params.inputValue)) filtered.push(params.inputValue);
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              options={subCategories}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.inputValue || option)}
              renderOption={(props, option) => <li {...props}>{option}</li>}
              fullWidth
              freeSolo
              renderInput={(params) => <TextField {...params} label="Select subcategory" />}
            />

            <div className="flex flex-col mb-4">
              <label className="mb-1 font-medium">Blog Body:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              />
            </div>
          </div>

          <DialogActions>
            <Button variant="outlined" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button disabled={loading} variant="contained" color="primary" onClick={handleSaveEdit}>
              {loading ? "Saving" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </TopHeadingProvider>
  );
}
