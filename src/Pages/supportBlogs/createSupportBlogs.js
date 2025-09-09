import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import toast from "react-hot-toast";
import TopHeading from "../../Components/TopHeading/TopHeading";
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

export default function CreateSupportBlog() {
  const [editorContent, setEditorContent] = useState("");
  const [viewers, setViewers] = useState("");
  const [header, setHeader] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingBlogs = async () => {
      const blogsRef = collection(db, "SupportBlogs");
      const snapshot = await blogsRef.get?.();
      setCategories([]);
      setSubCategories([]);
    };
    fetchExistingBlogs();
  }, []);

  const handleBlogSubmit = async () => {
    if (viewers && header && editorContent && subCategory) {
      setLoading(true);
      try {
        const blogsRef = collection(db, "SupportBlogs");
        await addDoc(blogsRef, {
          content: editorContent,
          viewers,
          header,
          subCategory,
          createdOn: new Date(),
        });
        toast.success("Blog submitted successfully!");
        setEditorContent("");
        setViewers("");
        setHeader("");
        setSubCategory("");
      } catch (err) {
        console.error(err);
        toast.error("Error submitting blog");
      }
      setLoading(false);
    } else {
      toast.error("Please fill all details");
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start p-10">
      <div className="flex flex-col w-full border bg-white/90 backdrop-blur-md rounded-lg shadow-lg">
        <div className="p-5 flex-1 overflow-auto">

          <div className="flex flex-col gap-4 mt-0 p-3 bg-white/50 backdrop-blur-md rounded-lg shadow-md mb-2">
            <h2 className="text-left text-xl font-semibold mb-3">Create a New Blog</h2>

            <Autocomplete
              value={viewers}
              className="mb-5"
              onChange={(event, newValue) => setViewers(newValue || "")}
              options={categories}
              freeSolo
              renderInput={(params) => <TextField {...params} label="Select category" />}
            />

            <Autocomplete
              value={subCategory}
              className="mb-5"
              onChange={(event, newValue) => setSubCategory(newValue || "")}
              options={subCategories}
              freeSolo
              renderInput={(params) => <TextField {...params} label="Select subcategory" />}
            />

            <TextField
              value={header}
              type="text"
              label="Blog Header"
              onChange={(e) => setHeader(e.target.value)}
              className="w-full min-h-[40px] mb-5"
            />

            <div className="flex flex-col mb-5">
              <label className="mb-2 font-medium">Blog Body:</label>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                className="w-full mt-2 min-h-[40px] p-3 bg-white/30 rounded-lg"
              />
            </div>

            <div className="flex gap-3 justify-end items-center">
              <Button variant="outlined" color="error" onClick={() => navigate("/supportBlogs")}>
                Close
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                color="success"
                onClick={handleBlogSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
