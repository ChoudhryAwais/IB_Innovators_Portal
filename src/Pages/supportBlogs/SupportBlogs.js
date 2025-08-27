import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import "./SupportBlogs.css";
import { db } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
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
import TopHeading from "../../Components/TopHeading/TopHeading";
import { TextField } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import Box from "@mui/material/Box";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

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

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "color",
  "font",
  "align",
  "size",
];

export default function SupportBlogs() {
  const [editorContent, setEditorContent] = useState("");
  const [viewers, setViewers] = useState("");
  const [header, setHeader] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState({});
  const [loading, setLoading] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const handleBlogSubmit = async () => {
    if (viewers !== "" && header !== "" && editorContent !== "" && subCategory !== "") {
      setLoading(true);
      const blogsRef = collection(db, "SupportBlogs");
      await addDoc(blogsRef, {
        content: editorContent,
        viewers: viewers,
        header: header,
        createdOn: new Date(),
        subCategory: subCategory,
      });
      setEditorContent("");
      setViewers("");
      setHeader("");
      setSubCategory("");
      toast.success("Blog submitted successfully!");
      setLoading(false);
    } else {
      toast("Please fill all details");
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "SupportBlogs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsArray = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setBlogs(blogsArray);

      const subCategorySet = new Set();
      const categorySet = new Set();
      snapshot.docs.forEach((doc) => {
        const subCategory = doc.data().subCategory;
        const category = doc.data().viewers;
        if (subCategory) {
          subCategorySet.add(subCategory);
        } if(category){
          categorySet.add(category)
        }
      });

      setSubCategories(Array.from(subCategorySet));
      setCategories(Array.from(categorySet))
    });

    return () => unsubscribe();
  }, []);

  const deleteBlog = async (id) => {
    setLoading(true);
    await deleteDoc(doc(db, "SupportBlogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
    setShowModal(false);
    setLoading(false);
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setEditorContent(blog.content);
    setViewers(blog.viewers);
    setHeader(blog.header);
    setSubCategory(blog.subCategory);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (viewers !== "" && header !== "" && editorContent !== "" && subCategory !== "") {
      setLoading(true);
      const blogRef = doc(db, "SupportBlogs", selectedBlog.id);
      await updateDoc(blogRef, {
        content: editorContent,
        viewers: viewers,
        header: header,
        subCategory: subCategory,
        updatedOn: new Date()
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

  // Pagination
  const upcomingItemsPerPage = 5;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
  const upcomingDisplayedSessions = blogs?.slice(upcomingStartIndex, upcomingEndIndex);

  return (
    <>
      <TopHeading>Support & Training Blogs</TopHeading>
      <div
        style={{
          display: "flex",
          paddingTop: "0px",
          flexWrap: "wrap",
          gap: "10px",
          marginRight: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          className="shadowAndBorder"
          style={{
            marginTop: "0px",
            flex: 1,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: "rgba(255,255,255, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ textAlign: "left" }}>Create a New Blog</h2>
         
          <Autocomplete
            value={viewers}
            style={{ marginBottom: "20px" }}
            onChange={(event, newValue) => {
              if (typeof newValue === "string") {
                setViewers(newValue);
              } else if (newValue && newValue.inputValue) {
                setViewers(newValue.inputValue);
              } else {
                setViewers(newValue);
              }
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter((option) =>
                option.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              const { inputValue } = params;
              if (inputValue !== "" && !options.includes(inputValue)) {
                filtered.push(inputValue);
              }
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={categories}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option;
            }}
            renderOption={(props, option) => <li {...props}>{option}</li>}
            fullWidth
            freeSolo
            renderInput={(params) => <TextField {...params} label="Select category" />}
          />

          <Autocomplete
            value={subCategory}
            style={{ marginBottom: "20px" }}
            onChange={(event, newValue) => {
              if (typeof newValue === "string") {
                setSubCategory(newValue);
              } else if (newValue && newValue.inputValue) {
                setSubCategory(newValue.inputValue);
              } else {
                setSubCategory(newValue);
              }
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter((option) =>
                option.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              const { inputValue } = params;
              if (inputValue !== "" && !options.includes(inputValue)) {
                filtered.push(inputValue);
              }
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={subCategories}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option;
            }}
            renderOption={(props, option) => <li {...props}>{option}</li>}
            fullWidth
            freeSolo
            renderInput={(params) => <TextField {...params} label="Select subcategory" />}
          />

          
<TextField
            value={header}
            type="text"
            label="Blog Header"
            onChange={(e) => setHeader(e.target.value)}
            style={{
              width: "100%",
              minHeight: "40px",
              marginBottom: "20px",
            }}
          />
          
          
          <div style={{ marginBottom: "20px" }} className="text-input-section">
            <label>Blog Body:</label>
            <ReactQuill
              value={editorContent}
              onChange={setEditorContent}
              modules={modules}
              formats={formats}
              style={{
                width: "100%",
                marginTop: "10px",
                minHeight: "40px",
                padding: "10px",
                background: "rgba(255,255,255,0.3)",
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="submit-section">
            <Button
              disabled={loading}
              variant="contained"
              style={{ width: "100%" }}
              onClick={handleBlogSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
        <div
          className="shadowAndBorder"
          style={{
            marginTop: "0px",
            flex: 1,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: "rgba(255,255,255, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ textAlign: "left" }}>Existing Blogs</h2>
          {upcomingDisplayedSessions.map((blog, index) => (
            <div
              style={{
                alignItems: "center",
                flexDirection: "row",
                display: "flex",
                justifyContent: "space-between",
                borderTop: index !== 0 ? "2px solid #ccc" : "none",
                gap: "10px",
                padding: "10px 5px",
              }}
              key={index}
            >
              <div
                style={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "1.1rem",
                }}
              >
                <div>{blog.header}</div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: blog?.content?.slice(0, 50),
                  }}
                  style={{ fontSize: "medium" }}
                ></div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Button
                  variant="outlined"
                  style={{
                    width: "100%",
                  }}
                  onClick={() => handleEditBlog(blog)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  style={{
                    width: "100%",
                  }}
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
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#ccc",
                fontSize: "1.5rem",
              }}
            >
              No Blogs
            </div>
          )}
          {blogs?.length > upcomingItemsPerPage && (
            <div
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
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
        <Dialog
          open={showModal}
          onClose={() => {
            setShowModal(false);
          }}
        >
          <DialogTitle>{"Please confirm if you want to delete this blog?"}</DialogTitle>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="contained"
              color="error"
              onClick={() => deleteBlog(selectedBlog?.id)}
            >
              {loading ? "Deleting" : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
          }}
        >
          <DialogTitle>Edit Blog</DialogTitle>
          <div style={{ padding: "20px" }}>
            <FormControl fullWidth>
              <InputLabel>Select category</InputLabel>
              <Select
                label="Select category"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
                value={viewers}
                onChange={(e) => setViewers(e.target.value)}
              >
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
              style={{
                width: "100%",
                minHeight: "40px",
                marginBottom: "20px",
              }}
            />
            <Autocomplete
              value={subCategory}
              style={{ marginBottom: "20px" }}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setSubCategory(newValue);
                } else if (newValue && newValue.inputValue) {
                  setSubCategory(newValue.inputValue);
                } else {
                  setSubCategory(newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(params.inputValue.toLowerCase())
                );
                const { inputValue } = params;
                if (inputValue !== "" && !options.includes(inputValue)) {
                  filtered.push(inputValue);
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              options={subCategories}
              getOptionLabel={(option) => {
                if (typeof option === "string") {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option;
              }}
              renderOption={(props, option) => <li {...props}>{option}</li>}
              fullWidth
              freeSolo
              renderInput={(params) => <TextField {...params} label="Select subcategory" />}
            />
            <div style={{ marginBottom: "20px" }} className="text-input-section">
              <label>Blog Body:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setShowEditModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
            >
              {loading ? "Saving" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}
