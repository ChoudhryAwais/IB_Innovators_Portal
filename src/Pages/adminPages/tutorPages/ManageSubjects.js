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
    <div className="p-4 sm:p-6">
      <div className="flex-1 mt-0 mb-2 p-4 sm:p-6 rounded-lg border border-[#A2A1A833] bg-white/50">

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Subjects ({subjects?.length || 0})
          </h2>

          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: "#4071B6",
              width: { xs: "100%", sm: "250px" },
              height: { xs: "44px", sm: "50px" },
              "&:hover": { backgroundColor: "#427ac9ff" },
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: "0.5rem",
              fontWeight: 500,
              textTransform: "none",
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            + Add a new subject
          </Button>
        </div>

        {/* Subjects List */}
        <List sx={{ padding: { xs: 0, sm: 1 } }}>
          {displayedSessions.map((subject) => (
            <ListItem 
              key={subject}
              sx={{
                padding: { xs: '12px 8px', sm: '16px' }
              }}
            >
              <ListItemText 
                primary={subject} 
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: { xs: '14px', sm: '16px' }
                  }
                }}
              />
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
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: { xs: '12px', sm: '14px' },
                    minWidth: { xs: '32px', sm: '36px' },
                    height: { xs: '32px', sm: '36px' },
                  }
                }}
              />
            </Stack>
          </div>
        )}

        {/* Create Subject Modal */}
        <CustomModal 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              width: { xs: "90%", sm: "500px" },
              maxWidth: { xs: "400px", sm: "500px" },
              margin: { xs: "20px", sm: "auto" }
            },
          }}
        >
          {/* Title */}
          <h2 className="text-lg sm:text-xl font-semibold text-start text-[#16151C] mb-4 sm:mb-7">
            Add New Subject
          </h2>

          <Divider sx={{ borderColor: "#E5E7EB", mb: 3, sm: 5 }} />

          {/* Input Field */}
          <TextField
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            label="Enter Subject Name"
            fullWidth
            sx={{ mb: 4, sm: 7 }}
            size="small"
          />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={() => {
                setNewSubject("")
                setOpenDialog(false)
              }}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: 166 },
                height: { xs: 44, sm: 50 },
                borderRadius: "10px",
                borderColor: "#A2A1A833",
                fontSize: { xs: "14px", sm: "16px" },
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
                width: { xs: "100%", sm: 166 },
                height: { xs: 44, sm: 50 },
                borderRadius: "10px",
                backgroundColor: "#4071B6",
                fontSize: { xs: "16px", sm: "20px" },
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