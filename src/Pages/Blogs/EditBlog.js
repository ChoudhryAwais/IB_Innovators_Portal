import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db, storage } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { Button, Chip, FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


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

export default function EditBlog({ item, onClose }) {
  const [url, setUrl] = useState(item?.url || "");
  const [editorContent, setEditorContent] = useState(item?.content || "");
  const [image, setImage] = useState(item?.image || null);
  const [selectedFile, setSelectedFile] = useState(item?.selectedFile || null);
  const [header, setHeader] = useState(item?.header || "");
  const [seoTags, setSeoTags] = useState(item?.seoTags || "");
  const [writtenBy, setWrittenBy] = useState(item?.writtenBy || "");
  const [duration, setDuration] = useState(item?.duration || "");
  const [description, setDescription] = useState(item?.description || "");
  const [selectedTags, setSelectedTags] = useState(item?.selectedTags || []);

  const navigate = useNavigate();

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
      setSelectedFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleBlogSubmit = async () => {
    try {
      let imageUrl = "";
      if (selectedFile) {
        const randomString = Math.random().toString(36).substring(7);
        const newFileName = `${randomString}_${selectedFile.name}`;
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

      const blogsRef = doc(db, "Blogs", item?.id);
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
      });

      setEditorContent("");
      setImage(null);
      setSelectedFile(null);
      setHeader("");
      toast.success("Blog updated successfully!");
      onClose && onClose();
    } catch (e) {
      console.error(e);
      toast.error("Error updating blog");
    }
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (!selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
    }
  };

  const handleDelete = (subjectToDelete) => {
    setSelectedTags((subjects) => subjects.filter((subject) => subject !== subjectToDelete));
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start p-10 ">
      <div className="flex flex-col w-[100%] border bg-white/90 backdrop-blur-md rounded-lg">
        <div className="p-5 flex-1 overflow-auto">
          <h2 className="text-left font-semibold text-2xl mb-5">Create a New Blog</h2>

          {/* Image Upload */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Select Image for the Blog:</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
            />
            {image && <img src={image} alt="Blog Preview" className="w-full max-h-[400px] object-cover mt-3 rounded" />}
          </div>

          {/* Blog URL */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Blog URL (without spacing, separate with "-"):</label>
            <input
              value={url}
              type="text"
              onChange={(e) => setUrl(e.target.value)}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder="revise-to-thrive"
            />
          </div>

          {/* Tags */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Select Tags:</label>
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
            <Box className="mt-2">
              {selectedTags.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onDelete={() => handleDelete(item)}
                  color="primary"
                  className="m-1 !bg-gray-800 !text-white"
                />
              ))}
            </Box>
          </div>

          {/* Written By */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Written By:</label>
            <input
              value={writtenBy}
              type="text"
              onChange={(e) => setWrittenBy(e.target.value)}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder="John Doe"
            />
          </div>

          {/* Duration */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Reading Duration:</label>
            <input
              value={duration}
              type="text"
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder="10 mins"
            />
          </div>

          {/* SEO Tags */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Blog SEO Tags:</label>
            <textarea
              value={seoTags}
              onChange={(e) => setSeoTags(e.target.value)}
              rows={3}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder={`<title>How It Works</title>
<meta name="title" content="IB Innovators - Home" />
<meta name="description" content="Welcome to IB Innovators, your go-to platform for personalized tutoring services." />
<link rel="canonical" href="https://ibinnovators.com" />`}
            />
          </div>

          {/* Header */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Blog Header (50 - 60 characters):</label>
            <input
              value={header}
              type="text"
              onChange={(e) => setHeader(e.target.value)}
              minLength={50}
              maxLength={60}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder="Enter blog header..."
            />
            <div className="text-right text-sm text-gray-500">{header?.length} / 60</div>
          </div>

          {/* Description */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Blog Description (70 - 160 characters):</label>
            <input
              value={description}
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              minLength={70}
              maxLength={160}
              className="w-full mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg"
              placeholder="Enter blog description..."
            />
            <div className="text-right text-sm text-gray-500">{description?.length} / 160</div>
          </div>

          {/* Blog Body */}
          <div className="mb-5 flex flex-col">
            <label className="mb-1 font-medium">Blog Body:</label>
            <ReactQuill value={editorContent} onChange={setEditorContent} modules={modules} formats={formats} />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end items-center">
            <Button variant="outlined" color="error" onClick={() => navigate("/blogs")}>
              Close
            </Button>
            <Button variant="contained" color="success" onClick={handleBlogSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
