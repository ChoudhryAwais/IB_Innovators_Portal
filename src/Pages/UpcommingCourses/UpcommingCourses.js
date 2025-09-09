import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
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
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FormComponent = () => {

    const { setFirstMessage, setSecondMessage } = useTopHeading()
    
      useEffect(() => {
        setFirstMessage("Upcoming Course")
        setSecondMessage("Show all Courses")
      }, [setFirstMessage, setSecondMessage])

  const [formData, setFormData] = useState({
    heading: "",
    tagline: "",
    startDate: "",
    endDate: "",
    lastDate: "",
    sessionNumber: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLink, setSelectedLink] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      await updateDoc(doc(db, "UpcomingCourses", selectedCourse.id), formData);
      toast.success("Course updated successfully!");
    } else {
      const coursesRef = collection(db, "UpcomingCourses");
      const docRef = await addDoc(coursesRef, formData);
      const courseId = docRef.id;
      const updatedFormData = { ...formData, id: courseId };
      await setDoc(doc(db, "UpcomingCourses", courseId), updatedFormData);
      toast.success("Course added successfully!");
    }

    setFormData({
      heading: "",
      tagline: "",
      startDate: "",
      endDate: "",
      lastDate: "",
      sessionNumber: "",
    });
    setIsEditMode(false);
    setShowEditModal(false);
    setShowCreateModal(false);
    setSelectedCourse(null);
  };

  const [receivedData, setReceivedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const blogsRef = collection(db, "UpcomingCourses");
      const unsubscribe = onSnapshot(blogsRef, (snapshot) => {
        const blogsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceivedData(blogsArray);
      });
      return () => unsubscribe();
    };

    fetchData();
  }, []);

  const deleteCourse = async (id) => {
    await deleteDoc(doc(db, "UpcomingCourses", id));
    setShowModal(false);
    toast.success("Course deleted");
  };

  const openEditModal = (course) => {
    setFormData(course);
    setSelectedCourse(course);
    setIsEditMode(true);
    setShowEditModal(true);
  };

  const upcomingItemsPerPage = 3;
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);

  const handleUpcomingChangePage = (event, newPage) => {
    setUpcomingCurrentPage(newPage);
  };

  const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
  const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
  const upcomingDisplayedSessions = receivedData?.slice(
    upcomingStartIndex,
    upcomingEndIndex
  );

  const options = [
    "Summer Course",
    "Rapid Revision Course",
    "Winter Bootcamp",
    "Spring Short Course & Paper Practice Session",
  ];

  return (
    <TopHeadingProvider>
      

      {/* Conditional Rendering */}
      {receivedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Button
            variant="contained"
            onClick={() => setShowCreateModal(true)}
          >
            Create a New Course
          </Button>
          <p className="text-gray-400 text-lg">No Courses Yet!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button
              variant="contained"
              onClick={() => setShowCreateModal(true)}
            >
              Create a New Course
            </Button>
          </div>

          {/* Upcoming Courses List */}
          <div className="w-full h-max p-4 rounded-lg shadow-lg bg-white/50 backdrop-blur-md">
            <h2 className="text-left mb-2">Upcoming Courses</h2>
            <div className="m-2">
              {upcomingDisplayedSessions.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 ${
                    index !== 0 ? "border-t border-gray-300" : ""
                  }`}
                >
                  <div className="flex-3">
                    <p className="font-bold text-lg">{item.heading}</p>
                    <div>Tagline: {item.tagline}</div>
                    <div>Start Date: {item.startDate}</div>
                    <div>End Date: {item.endDate}</div>
                    <div>Last Date: {item.lastDate}</div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Button
                      variant="outlined"
                      className="w-full"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      className="w-full"
                      onClick={() => {
                        setShowModal(true);
                        setSelectedLink(item);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {receivedData?.length > upcomingItemsPerPage && (
                <div className="flex justify-center mt-5">
                  <Stack spacing={2}>
                    <Pagination
                      count={Math.ceil(
                        receivedData?.length / upcomingItemsPerPage
                      )}
                      page={upcomingCurrentPage}
                      onChange={handleUpcomingChangePage}
                    />
                  </Stack>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      <Dialog
        open={showCreateModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setShowCreateModal(false)}
      >
        <DialogTitle>Create Course</DialogTitle>
        <form className="p-5 flex flex-col space-y-3" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              label="Select Course"
              name="heading"
              value={formData?.heading}
              onChange={handleChange}
            >
              {options?.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Last Date"
            name="lastDate"
            type="date"
            value={formData.lastDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Session Number"
            name="sessionNumber"
            value={formData.sessionNumber}
            onChange={handleChange}
            fullWidth
          />
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {isEditMode ? "Update Course" : "Submit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog
        open={showEditModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowEditModal(false);
          setIsEditMode(false);
          setFormData({
            heading: "",
            tagline: "",
            startDate: "",
            endDate: "",
            lastDate: "",
            sessionNumber: "",
          });
        }}
      >
        <DialogTitle>Edit Course</DialogTitle>
        <form className="p-5 flex flex-col space-y-3" onSubmit={handleSubmit}>
          <TextField
            label="Heading"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Last Date"
            name="lastDate"
            type="date"
            value={formData.lastDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Session Number"
            name="sessionNumber"
            value={formData.sessionNumber}
            onChange={handleChange}
            fullWidth
          />
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setShowEditModal(false);
                setIsEditMode(false);
                setFormData({
                  heading: "",
                  tagline: "",
                  startDate: "",
                  endDate: "",
                  lastDate: "",
                  sessionNumber: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setShowModal(false)}
      >
        <DialogTitle>
          Please confirm if you want to delete this course?
        </DialogTitle>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteCourse(selectedLink?.id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TopHeadingProvider>
  );
};

export default FormComponent;
