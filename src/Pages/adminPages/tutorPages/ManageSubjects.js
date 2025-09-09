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
} from "@mui/material";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-hot-toast";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"


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
    <div className="flex-1 mt-0 mb-2 p-3 rounded-lg shadow-lg bg-white/50 backdrop-blur-md">
      <h2 className="text-left font-semibold text-lg mb-4">Subjects</h2>
      <Button
        variant="contained"
        className="w-full"
        onClick={() => setOpenDialog(true)}
      >
        Add New Subject
      </Button>

      <List>
        {displayedSessions.map((subject) => (
          <ListItem key={subject}>
            <ListItemText primary={subject} />
            <ListItemSecondaryAction>
              
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {subjects?.length > itemsPerPage && (
        <div className="flex items-center justify-center">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(subjects?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      <Modal open={openDialog}>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col w-[70%] max-w-[1000px] max-h-[90vh] overflow-hidden rounded-lg shadow-lg bg-white/70 backdrop-blur-md">
            <div className="p-5 flex-1 overflow-auto">
              <h2>Add New Subject</h2>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter Subject Name"
                  className="w-full p-2.5 my-2.5 border border-gray-300 bg-white/50 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="contained" color="success" onClick={handleAddSubject}>
                  Add Subject
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
