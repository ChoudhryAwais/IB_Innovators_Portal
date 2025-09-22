import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { Button, ListItemButton, Divider } from "@mui/material";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { toast } from "react-hot-toast";
import CustomModal from "../../Components/CustomModal/CustomModal"

const ProcessedTutorForm = () => {
  const [tutors, setTutors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedTutorForm");
    const orderCollectionRef = collection(customDocRef, "processedTutorForm");
    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"));

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        setTutors(fetchedData);
      },
      (error) => {
        toast.error("Error fetching data: " + error.message);
      }
    );

    return () => unsubscribe();
  };

  const handleDeleteClick = async (tutor) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "processedTutorForm");
      const orderCollectionRef = collection(customDocRef, "processedTutorForm");
      const docRef = doc(orderCollectionRef, tutor.id);
      await deleteDoc(docRef);
      setShowModal(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Error deleting tutor form");
      console.error("Error deleting tutor form: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = tutors?.slice(startIndex, endIndex);

  function formatDateTime(timestampData) {
    if (!timestampData) return { date: "N/A", time: "N/A" };
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
    );
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return { date: formattedDate, time: formattedTime };
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
      <div className="mb-6 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#16151C]">Processed Forms</h2>
        <span className="text-sm text-[#16151C]">
          {String(tutors?.length).padStart(2, "0")} Forms
        </span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((tutor, index) => (
          <ListItemButton
            key={index}
            onClick={() => {
              setSelectedLink(tutor);
              setShowModal(true);
            }}
            sx={{
              borderRadius: "8px",
              p: 1,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#F9FAFB" },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium text-[#16151C]">
                {tutor?.firstName} {tutor?.lastName}
              </span>
              <span className="text-sm text-[#16151C]">{tutor?.email || "N/A"}</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
          </ListItemButton>
        ))}
      </div>

      {tutors?.length === 0 && (
        <div className="text-center text-[#16151C] pb-4 mb-2">
          No Processed Forms
        </div>
      )}

      {showModal && selectedLink && (
        <CustomModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedLink({});
          }}
          PaperProps={{
            sx: {
              width: "90vw",
              maxWidth: "760px",
              height: "auto",
              maxHeight: "90vh",
              overflow: "hidden",
              borderRadius: "20px",
              padding: 0,
            },
          }}
        >
          <div className="h-full overflow-auto p-6" style={{ boxSizing: "border-box" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#16151C]">
                Processed Tutor Form Details
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: "#16151C",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minWidth: "unset",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    width="16"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "#16151C" }}
                  >
                    <path
                      d="M11 3H11.75C13.4069 3 14.75 4.34315 14.75 6V13.5C14.75 15.1569 13.4069 16.5 11.75 16.5H4.25C2.59315 16.5 1.25 15.1569 1.25 13.5V6C1.25 4.34315 2.59315 3 4.25 3H5M11 3C11 3.82843 10.3284 4.5 9.5 4.5H6.5C5.67157 4.5 5 3.82843 5 3M11 3C11 2.17157 10.3284 1.5 9.5 1.5H6.5C5.67157 1.5 5 2.17157 5 3M5 7.5H11M5 10.5H11M5 13.5H8"
                      stroke="#16151C"
                      strokeWidth="1.125"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-light text-xs">Copy Text</span>
                </Button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    className="w-5 h-5 text-[#16151C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />

            {/* Main Grid - Two Column Key-Value Layout */}
            <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-12 text-sm">
              <span className="text-[#16151C] font-medium">Name:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.firstName} {selectedLink?.lastName}
              </span>

              {/* <span className="text-[#16151C] font-medium">Submission Date:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.submittedOn
                  ? new Date(
                    selectedLink?.submittedOn.seconds * 1000 +
                    selectedLink?.submittedOn.nanoseconds / 1000000
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  : "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Submission Time:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.submittedOn
                  ? new Date(
                    selectedLink?.submittedOn.seconds * 1000 +
                    selectedLink?.submittedOn.nanoseconds / 1000000
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  : "N/A"}
              </span> */}

              <span className="text-[#16151C] font-medium">City:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.city || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">State:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.state || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Zip:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.zip || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Email:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.email || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Programmes:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.programmes?.join(", ") || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Subjects:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.subjects?.join(", ") || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Assignments:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.assignments?.join(", ") || "N/A"}
              </span>

              <span className="text-[#16151C] font-medium">Curricula:</span>
              <span className="text-[#16151C] font-semibold">
                {selectedLink?.curricula?.join(", ") || "N/A"}
              </span>

              
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {/* Left side - View Resume Button */}
              {selectedLink?.resume && (
                <Button
                  component="a"
                  href={selectedLink?.resume}
                  download
                  variant="outlined"
                  sx={{
                    width: 166,
                    height: 50,
                    borderRadius: "8px",
                    borderColor: "#4071B6",
                    backgroundColor: "#4071B60D",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4071B6",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#4071B6",
                      backgroundColor: "#F0F4FA",
                    },
                  }}
                >
                  Download Resume
                </Button>
              )}

              {/* Right side - Cancel + Delete */}
              <div className="flex gap-3">
                
                <Button
                  disabled={loading}
                  variant="outlined"
                  color="error"
                  sx={{
                    width: 166,
                    height: 50,
                    borderRadius: "8px",
                    backgroundColor: "#A81E1E0D",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#A81E1E",
                    borderColor: "#A81E1E",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#A81E1E0D" },
                    "&:disabled": { backgroundColor: "#9CA3AF" },
                  }}
                  onClick={() => handleDeleteClick(selectedLink)}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>

          </div>
        </CustomModal>
      )}


      {tutors?.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(tutors?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default ProcessedTutorForm;
