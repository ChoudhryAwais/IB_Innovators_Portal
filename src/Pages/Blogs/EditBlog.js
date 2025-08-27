import React, { useState, useEffect, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles
import "./Blogs.css";
import { db, storage } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  where,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../Context/MyContext";

import {
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Modal } from "@mui/material";
import { toast } from "react-hot-toast";

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
} from "@mui/material";

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

export default function EditBlog({ item, onClose }) {
  const [url, setUrl] = useState(item?.url ? item?.url : "");
  const [editorContent, setEditorContent] = useState(
    item?.content ? item?.content : ""
  );
  const [image, setImage] = useState(item?.image ? item?.image : null);
  const [selectedFile, setSelectedFile] = useState(
    item?.selectedFile ? item?.selectedFile : null
  );
  const [header, setHeader] = useState(item?.header ? item?.header : "");
  const [seoTags, setSeoTags] = useState(item?.seoTags ? item?.seoTags : "");

  const [writtenBy, setWrittenBy] = useState(
    item?.writtenBy ? item?.writtenBy : ""
  );
  const [duration, setDuration] = useState(
    item?.duration ? item?.duration : ""
  );
  const [description, setDescription] = useState(
    item?.description ? item?.description : ""
  );

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Set the selected file
      setImage(URL.createObjectURL(file)); // Preview
    }
  };

  const handleBlogSubmit = async () => {
    try {
      let imageUrl = "";

      // First, upload the image to Firebase Storage
      if (selectedFile) {
        // Generate a random string to prepend to the file name
        const randomString = Math.random().toString(36).substring(7);

        // Get the file extension
        const fileExtension = selectedFile.name.split(".").pop();

        // Prepend the random string to the file name and concatenate the file extension
        const newFileName = `${randomString}_${selectedFile.name}`;

        // Create a storage reference with the new file name
        const storageRef = ref(storage, `blog_images/${newFileName}`);

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
      const blogsRef = doc(db, "Blogs", item?.id);
      await updateDoc(blogsRef, {
        content: editorContent,
        image: imageUrl !== "" ? imageUrl : item?.image,
        header: header,
        updatedOn: new Date(), // Corrected to use new Date()
        seoTags,
        url,
        selectedTags,
        writtenBy,
        duration,
        description,
      });

      // Reset states
      setEditorContent("");
      setImage(null);
      setSelectedFile(null);
      setHeader("");
      toast.success("Blog updated successfully!");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Error updating blog");
    }
  };

  const [selectedTags, setSelectedTags] = useState(
    item?.selectedTags ? item?.selectedTags : []
  );

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

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // center the modal content vertically and horizontally
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: "70%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.8)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            padding: "20px",
            flex: 1,
            overflow: "auto",
          }}
        >
          <>
            <h2 style={{ textAlign: "left" }}>Create a New Blog</h2>

            <div
              style={{ marginBottom: "20px" }}
              className="image-upload-section"
            >
              <label>Select Image for the Blog:</label>
              <input
                type="file"
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
              />
              {image && <img src={image} alt="Blog Preview" className="image" />}
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog URL (without spacing, separate with "-"):</label>
              <input
                value={url}
                type="text"
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
                placeholder="revise-to-thrive"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Select Tags:</label>
              <Box>
                <FormControl fullWidth variant="outlined" margin="normal">
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
              </Box>
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
              <input
                value={writtenBy}
                type="text"
                onChange={(e) => {
                  setWrittenBy(e.target.value);
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
                placeholder="John Doe"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Reading Duration:</label>
              <input
                value={duration}
                type="text"
                onChange={(e) => {
                  setDuration(e.target.value);
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
                placeholder="10 mins"
              />
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog SEO Tags:</label>
              <textarea
                value={seoTags}
                type="text"
                onChange={(e) => {
                  setSeoTags(e.target.value);
                }}
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
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
              <input
                value={header}
                type="text"
                onChange={(e) => {
                  setHeader(e.target.value);
                }}
                minLength={50}
                maxLength={60}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
                placeholder="Enter blog header..."
              />
              <div style={{flex: 1, textAlign: 'right'}}>{header?.length} / 60</div>
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog Description (70 - 160 characters):</label>
              <input
                value={description}
                type="text"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                minLength={70}
                maxLength={160}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  minHeight: "40px",
                  padding: "10px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                }}
                placeholder="Enter blog description..."
              />
              <div style={{flex: 1, textAlign: 'right'}}>{description?.length} / 160</div>
            </div>

            <div
              style={{ marginBottom: "20px" }}
              className="text-input-section"
            >
              <label>Blog Body:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                alignItems: "center",
                flexDirection: "row",
              }}
              className="submit-section"
            >
              <Button variant="outlined" color="error" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleBlogSubmit}
              >
                Submit
              </Button>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
