import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  query,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "@mui/material";
import { toast } from "react-hot-toast";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});



export function ManageSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [deleteSubject, setDeleteSubject] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [newSubject, setNewSubject] = useState("");
  
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
  
    const handleDeleteSubject = async () => {
        try {
          const userListRef = collection(db, "subjectsAvailable");
          const querySnapshot = await getDocs(userListRef);
          querySnapshot.forEach((doc) => {
            const existingSubjects = doc.data().subjects || [];
            const updatedSubjects = existingSubjects.filter((subject) => subject !== deleteSubject);
            updateDoc(doc.ref, { subjects: updatedSubjects });
          });
      
          setDeleteDialog(false);
          const newSubjects = subjects.filter((subject) => subject !== deleteSubject)
          const flattenedAndSortedSubjects = newSubjects.flat().sort();
          setSubjects(flattenedAndSortedSubjects);
          setDeleteSubject(null);
          toast.success("Subject Deleted");
        } catch (error) {
          console.error("Error deleting subject: ", error);
          toast.error("Error deleting subject: ", error);
        }
      };
      
      
  
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
          toast.success("Subject Added")
        } catch (error) {
            toast.error("Error adding subject: ", error);
        }
      };


        // PAST LESSONS PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = subjects?.slice(startIndex, endIndex);
      
      
  
    return (
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
        <h2 style={{ textAlign: "left" }}>Subjects</h2>
        <Button variant="contained" style={{width: '100%'}} onClick={() => setOpenDialog(true)}>Add New Subject</Button>
        <List>
          {displayedSessions.map((subject) => (
            <ListItem key={subject}>
              <ListItemText primary={subject} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {
                    setDeleteSubject(subject);
                    setDeleteDialog(true);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {subjects?.length >itemsPerPage && 
<div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
<Stack spacing={2}>
      <Pagination  count={Math.ceil(subjects?.length / itemsPerPage)}
          page={currentPage}
          onChange={handleChangePage} />
    </Stack>
    </div>
}



        <Dialog
        open={deleteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
            setDeleteDialog(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{`Are you sure you want to delete ${deleteSubject}?`}</DialogTitle>

        <DialogActions>

        <Button  variant="outlined" color="error" onClick={() => {
              setDeleteDialog(false);
            }}>CANCEL</Button>

    <Button variant="contained" color="success" onClick={() => {
              handleDeleteSubject();
            }}>DELETE</Button>

        </DialogActions>
      </Dialog>


        <Modal
        open={openDialog}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
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
        background: 'rgba(255,255,255, 0.7)',
        backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
        WebkitBackdropFilter: 'blur(4px)', // For Safari support,
        borderRadius: '10px',
        
      }}
    >

<div style={{
        padding: "20px", flex: 1, overflow: 'auto'}}>
            <h2>Add New Subject</h2>

            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter Subject Name"
                style={{
                  width: "100%",
                  padding: "10px",
                  margin: "10px 0",
                  border: "1px solid #ccc",
                  background: 'rgba(255,255,255,0.5)', borderRadius: '10px' 
                }}
              />
            </div>
            <div style={{ flexDirection: "row", display: "flex", justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error"
               onClick={() => setOpenDialog(false)}
                style={{
                  marginRight: "10px",
                }}
              >
                Cancel
              </Button>
              <Button variant="contained" color="success"
                onClick={handleAddSubject}
              >
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
  
