import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"
import CustomModal from "../../../Components/CustomModal/CustomModal";
import Divider from "@mui/material/Divider"



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [deleteSubject, setDeleteSubject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const { setFirstMessage, setSecondMessage } = useTopHeading()
  useEffect(() => {
    setFirstMessage("Subjects")
    setSecondMessage("Show all Subjects")
  }, [setFirstMessage, setSecondMessage])


  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const userListRef = collection(db, "subjectsAvailable");
        const unsubscribe = onSnapshot(userListRef, (querySnapshot) => {
          const subjectsData = [];
          querySnapshot.forEach((doc) => {
            subjectsData.push(...doc.data().subjects);
          });
          const uniqueSortedSubjects = Array.from(new Set(subjectsData)).sort();
          setSubjects(uniqueSortedSubjects);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching subjects: ", error);
      }
    };
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    try {
      const userListRef = collection(db, "subjectsAvailable");
      const querySnapshot = await getDocs(userListRef);
      querySnapshot.forEach((doc) => {
        const existingSubjects = doc.data().subjects || [];
        const updatedSubjects = [...existingSubjects, newSubject];
        updateDoc(doc.ref, { subjects: updatedSubjects });
      });

      const updatedSubjects = [...subjects, newSubject];
      const flattenedAndSortedSubjects = updatedSubjects.flat().sort();
      setSubjects(flattenedAndSortedSubjects);

      setNewSubject("");
      setOpenDialog(false);
      toast.success("Subject Added");
    } catch (error) {
      toast.error("Error adding subject: ", error);
    }
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = subjects?.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="flex-1 mt-0 mb-2 p-6 rounded-lg border border-[#A2A1A833] bg-white/50">

        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Subjects ({subjects?.length || 0})
          </h2>

          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: "#4071B6",
              width: "250px",
              height: "50px",
              "&:hover": { backgroundColor: "#427ac9ff" },
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: "0.5rem",
              fontWeight: 500,
              textTransform: "none",
              fontSize: "16px",
            }}
          >
            + Add a new subject
          </Button>
        </div>

        {/* Subjects List */}
        <List>
          {displayedSessions.map((subject) => (
            <ListItem key={subject}>
              <ListItemText primary={subject} />
              <ListItemSecondaryAction>
                {/* Action buttons can go here later if needed */}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Pagination */}
        {subjects?.length > itemsPerPage && (
          <div className="flex items-center justify-center mt-4">
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(subjects?.length / itemsPerPage)}
                page={currentPage}
                onChange={handleChangePage}
              />
            </Stack>
          </div>
        )}

        {/* Create Subject Modal */}
        {/* Create Subject Modal */}
        <CustomModal open={openDialog} onClose={() => setOpenDialog(false)}>
          {/* Title */}
          <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
            Add New Subject
          </h2>

          <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

          {/* Input Field */}
          <TextField
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            label="Enter Subject Name"
            fullWidth
            sx={{ mb: 7 }}
          />

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => {
                setNewSubject("")
                setOpenDialog(false)
              }}
              variant="outlined"
              sx={{
                width: 166,
                height: 50,
                borderRadius: "10px",
                borderColor: "#A2A1A833",
                fontSize: "16px",
                fontWeight: 300,
                color: "#16151C",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSubject}
              sx={{
                width: 166,
                height: 50,
                borderRadius: "10px",
                backgroundColor: "#4071B6",
                fontSize: "20px",
                fontWeight: 300,
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": { backgroundColor: "#305a91" },
              }}
            >
              Add
            </Button>
          </div>
        </CustomModal>

      </div>
    </div>
  );

}
