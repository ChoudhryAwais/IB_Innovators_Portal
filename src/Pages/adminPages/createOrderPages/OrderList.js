import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { IconButton, Modal } from "@mui/material";
import { ViewApplicants } from "./ViewApplicants";
import { Delete } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function OrderList() {
  const { userDetails } = useContext(MyContext);
  const [data, setData] = useState([]);
  const [searchedData, setSearchedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState("");

  // Fetching orders
  const fetchData = () => {
    try {
      const userListRef = collection(db, "orders");
      const unsubscribe = onSnapshot(
        query(userListRef, orderBy("createdOn", "desc")),
        (querySnapshot) => {
          const orderData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(orderData);
          setSearchedData(orderData);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => {
      unsubscribe();
    };
  }, []);

  function handleSearch(e) {
    const searchedText = e.target.value.toLowerCase();
    if (searchedText.length >= 2) {
      setSearchedData(
        data.filter((item) => {
          return (
            item?.studentName?.toLowerCase().includes(searchedText) ||
            item?.subject?.toLowerCase().includes(searchedText) ||
            item?.id?.toLowerCase().includes(searchedText) ||
            item?.studentInformation?.email?.toLowerCase().includes(searchedText) ||
            item?.country?.toLowerCase().includes(searchedText)
          );
        })
      );
    } else {
      setSearchedData(data);
    }
  }

  // Pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = searchedData?.slice(startIndex, endIndex);

  const closingModal = (val) => setShowModal(val);

  // 🔥 Delete Logic
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "orders", deleteTargetId));
      setData((prev) => prev.filter((item) => item.id !== deleteTargetId));
      setSearchedData((prev) => prev.filter((item) => item.id !== deleteTargetId));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId("");
    }
  };

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
      <h2 style={{ textAlign: "left" }}>Jobs</h2>

      {data.length !== 0 && (
        <div
          style={{
            marginBottom: "10px",
            marginTop: "20px",
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderBottom: "2px solid #ccc",
          }}
        >
          <FontAwesomeIcon
            style={{ marginLeft: "10px", marginRight: "10px" }}
            icon={faMagnifyingGlass}
          />
          <input
            onChange={handleSearch}
            placeholder="Search via ID / Name / Email / Subject / Country"
            style={{
              border: "none",
              flex: 1,
              outline: "none",
              background: "transparent",
            }}
            defaultValue=""
          />
        </div>
      )}

      {displayedSessions.map((item, index) => (
        <div
          key={item?.id}
          style={{
            flex: 1,
            borderTop: index !== 0 ? "2px solid #ccc" : "none",
            padding: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <div>Order ID: {item?.id}</div>
            <IconButton
              style={{ color: "darkred" }}
              onClick={() => handleDeleteClick(item?.id)}
            >
              <Delete />
            </IconButton>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <div style={{ fontSize: "large" }}>{item?.subject}</div>
            <div style={{ fontSize: "small", textAlign: "right" }}>
              Required by {item?.studentName}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <div style={{ fontSize: "medium" }}>{item?.country}</div>
            <div style={{ fontSize: "small", transform: "translateY(-12px)" }}>
              <div>Hourly Rate (USD): ${item?.tutorHourlyRate}</div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <FontAwesomeIcon
                style={{ marginLeft: "10px" }}
                icon={faGraduationCap}
              />{" "}
              {item?.studentName}
            </div>
            <div>
              <div
                style={{
                  fontSize: "small",
                  textAlign: "right",
                  marginBottom: "3px",
                }}
              >
                {item?.applicants ? item?.applicants.length : 0} Applicants
              </div>
              <Button
                variant="contained"
                onClick={() => {
                  setShowModal(true);
                  setSelectedItem(item);
                }}
              >
                VIEW APPLICANTS
              </Button>
            </div>
          </div>
        </div>
      ))}

      {searchedData?.length > itemsPerPage && (
        <div
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Stack style={{ marginTop: "10px" }} spacing={2}>
            <Pagination
              count={Math.ceil(data?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {searchedData?.length === 0 && (
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#ccc",
            fontSize: "1.5rem",
          }}
        >
          No Orders
        </div>
      )}

      <Modal
        open={showModal}
        TransitionComponent={Transition}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <ViewApplicants item={selectedItem} handleClose={closingModal} />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setDeleteDialogOpen(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Delete Order?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
