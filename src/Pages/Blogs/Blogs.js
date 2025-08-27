import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import "./Blogs.css";
import { db, storage } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";

import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Modal, TextField } from "@mui/material";
import EditBlog from "./EditBlog";
import { toast } from "react-hot-toast";

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import TopHeading from "../../Components/TopHeading/TopHeading";

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

export default function Blogs() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [url, setUrl] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [header, setHeader] = useState("");
  const [seoTags, setSeoTags] = useState("");
  const [writtenBy, setWrittenBy] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});

  const [loading, setLoading] = useState(false);

  const [blogs, setBlogs] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Set the selected file
      setImage(URL.createObjectURL(file)); // Preview
    }
  };

  const handleBlogSubmit = async () => {
    try {
      setLoading(true);
      if (selectedFile && url !== "" && header !== "" && editorContent !== "") {
        let imageUrl = "";

        // First, upload the image to Firebase Storage
        if (selectedFile) {
          // Generate a random string to prepend to the file name
          const randomString = Math.random().toString(36).substring(7);

          // Get the file extension
          const fileExtension = selectedFile.name.split(".").pop();

          // Prepend the random string to the file name and concatenate the file extension
          const newFileName = randomString + "_" + selectedFile.name;

          // Create a storage reference with the new file name
          const storageRef = ref(storage, "blog_images/" + newFileName);

          const fileArrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(selectedFile);
          });

          await uploadBytes(storageRef, fileArrayBuffer);
          imageUrl = await getDownloadURL(storageRef);
        }

        // Then, save the blog content to Firestore
        const blogsRef = collection(db, "Blogs");
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
        });
        setEditorContent("");
        setImage(null);
        setSelectedFile(null);
        setHeader("");
        toast.success("Blog submitted successfully!");
      } else {
        toast.error("Please fill all details");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [selectedTags, setSelectedTags] = useState([]);

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (!selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
    }
  };

  const handleDelete = (subjectToDelete) => {
    setSelectedTags((subjects) =>
      subjects.filter((subject) => subject !== subjectToDelete)
    );
  };

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
  ];

  useEffect(() => {
    const q = query(collection(db, "Blogs"));

    // Start real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    // Stop listening for changes when component unmounts
    return () => unsubscribe();
  }, []);

  const deleteBlog = async (id) => {
    await deleteDoc(doc(db, "Blogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
    setShowModal(false);
  };

  const editBlog = (blog) => {
    setEditorContent(blog.content);
    setImage(blog.image);
    setHeader(blog.header);
    // Note: You'll also need to update Firestore when you're done editing.
    // Add a mechanism to differentiate between a new blog and an edited blog.
  };

  // UPCOMING LESSONS PAGINATION

  const upcomingItemsPerPage = 5;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = React.useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
  const upcomingDisplayedSessions = blogs?.slice(
    upcomingStartIndex,
    upcomingEndIndex
  );

  return (
    <>
      <TopHeading>Blogs</TopHeading>

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
            backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
            WebkitBackdropFilter: "blur(4px)", // For Safari support,
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <>
            <h2 style={{ textAlign: "left" }}>Create a New Blog</h2>

            <div
              style={{ marginBottom: "20px" }}
              className="image-upload-section"
            >
              <label>Select Image for the Blog:</label>
              <TextField
                type="file"
                onChange={handleImageChange}
                fullWidth
                placeholder="Select Image"
              />
              {image && (
                <img className="image" src={image} alt="Blog Preview" />
              )}
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog URL (without spacing, separate with "-"):</label>
              <TextField
                value={url}
                type="text"
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                fullWidth
                placeholder="revise-to-thrive"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Select Tags:</label>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select</InputLabel>
                <Select value="" onChange={handleSelectChange} label="Select">
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  {tags.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                {selectedTags.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onDelete={() => handleDelete(item)}
                    color="primary"
                    style={{ margin: "5px", background: "#3e3e3e" }}
                    // style={{ margin: "0.5rem" }}
                  />
                ))}
              </Box>
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Written By:</label>
              <TextField
                value={writtenBy}
                type="text"
                onChange={(e) => {
                  setWrittenBy(e.target.value);
                }}
                fullWidth
                placeholder="John Doe"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Reading Duration:</label>
              <TextField
                value={duration}
                type="text"
                onChange={(e) => {
                  setDuration(e.target.value);
                }}
                fullWidth
                placeholder="10 mins"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog SEO Tags:</label>
              <TextField
                value={seoTags}
                type="text"
                onChange={(e) => {
                  setSeoTags(e.target.value);
                }}
                rows={3}
                fullWidth
                multiline
                placeholder={`<title>How It Works</title>
<meta name="title" content="IB Innovators - Home" />
<meta name="description" content="Welcome to IB Innovators, your go-to platform for personalized tutoring services." />
<link rel="canonical" href="https://ibinnovators.com" />
`}
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog Header (50 - 60 characters):</label>
              <TextField
                value={header}
                type="text"
                onChange={(e) => {
                  setHeader(e.target.value);
                }}
                minLength={50}
                maxLength={60}
                fullWidth
                placeholder="Enter blog header..."
              />
              <div style={{ flex: 1, textAlign: "right" }}>
                {header?.length} / 60
              </div>
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog Description (70 - 160 characters):</label>
              <TextField
                value={description}
                type="text"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                minLength={70}
                maxLength={160}
                fullWidth
                placeholder="Enter blog description..."
              />
              <div style={{ flex: 1, textAlign: "right" }}>
                {description?.length} / 160
              </div>
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog Summary:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
              />
            </div>

            <div className="submit-section">
              <Button
                disabled={loading}
                variant="contained"
                fullWidth
                onClick={handleBlogSubmit}
              >
                {loading ? "Submitting" : "Submit"}
              </Button>
            </div>
          </>
        </div>

        <div
          className="shadowAndBorder"
          style={{
            marginTop: "0px",
            flex: 1,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: "rgba(255,255,255, 0.5)",
            backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
            WebkitBackdropFilter: "blur(4px)", // For Safari support,
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ textAlign: "left" }}>Existing Blogs</h2>
          {upcomingDisplayedSessions.map((blog, index) => (
            <div
              style={{
                padding: "1rem",
                alignItems: "center",
                flexDirection: "row",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                borderTop: index !== 0 ? "2px solid #ccc" : "none",
              }}
              key={blog.id}
            >
              <div style={{ flexDirection: "row", display: "flex", flex: 1 }}>
                <div style={{ flex: 3, display: "flex", alignItems: "center" }}>
                  <p style={{ fontSize: "1.2rem" }}>{blog.header}</p>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "flex-end",
                    flexDirection: "column",
                    gap: "10px",
                    margin: "5px",
                  }}
                >
                  <Button
                    onClick={() => {
                      setSelectedLink(blog);
                      setShowEditModal(true);
                    }}
                    variant="outlined"
                    fullWidth
                  >
                    Edit
                  </Button>
                  {/* <button style={{marginRight: '1rem'}} onClick={() => editBlog(blog)}>Edit</button> */}
                  <Button
                    onClick={() => {
                      setSelectedLink(blog);
                      setShowModal(true);
                    }}
                    variant="outlined"
                    color="error"
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
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
          TransitionComponent={Transition}
          keepMounted
          onClose={() => {
            setShowModal(false);
          }}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>
            {"Please confirm if you want to delete this blog?"}
          </DialogTitle>

          <DialogActions>
            <Button
              style={{ fontSize: "1.2rem", color: "darkred" }}
              onClick={() => {
                setShowModal(false);
              }}
            >
              cancel
            </Button>
            <Button
              style={{ fontSize: "1.2rem" }}
              onClick={() => deleteBlog(selectedLink?.id)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Modal open={showEditModal}>
          <EditBlog
            item={selectedLink}
            onClose={() => {
              setShowEditModal(false);
            }}
          />
        </Modal>
      </div>
    </>
  );
}
