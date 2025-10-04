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
  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, Math.ceil(tutors?.length / itemsPerPage));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
      <div className="mb-6 pb-2 border-b border-gray-200">
        <h2 className="text-[20px] font-semibold text-[#16151C]">Processed Forms</h2>
        <span className="text-[14px] font-light text-[#A2A1A8]">
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
              pl: 0,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#F9FAFB" },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col">
              <span className="font-light text-[16px] text-[#16151C]">
                {tutor?.firstName} {tutor?.lastName}
              </span>
              <span className="text-[12px] font-light text-[#A2A1A8]">{tutor?.email || "N/A"}</span>
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
            <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-20 text-[14px]">
              <span className="text-[#16151C] font-light">Name:</span>
              <span className="text-[#16151C] font-medium">
                {selectedLink?.firstName} {selectedLink?.lastName}
              </span>

              {/* <span className="text-[#16151C] font-medium">Submission Date:</span>
                <span className="text-[#16151C] font-semibold">
                  {formatDateTime(selectedLink?.submittedAt)?.split(" - ")[1] || "N/A"}
                </span>

                <span className="text-[#16151C] font-medium">Submission Time:</span>
                <span className="text-[#16151C] font-semibold">
                  {formatDateTime(selectedLink?.submittedAt)?.split(" - ")[0] || "N/A"}
                </span> */}

              <span className="text-[#16151C] font-light">Email:</span>
              <span className="text-[#16151C] font-medium">{selectedLink?.email || "N/A"}</span>

              <span className="text-[#16151C] font-light">City:</span>
              <span className="text-[#16151C] font-medium">{selectedLink?.city || "N/A"}</span>

              <span className="text-[#16151C] font-light">State:</span>
              <span className="text-[#16151C] font-medium">{selectedLink?.state || "N/A"}</span>

              <span className="text-[#16151C] font-light">Zip:</span>
              <span className="text-[#16151C] font-medium">{selectedLink?.zip || "N/A"}</span>

              <span className="text-[#16151C] font-light">Programmes:</span>
              <span className="text-[#16151C] font-medium">
                {selectedLink?.programmes?.join(", ") || "--------"}
              </span>

              <span className="text-[#16151C] font-light">Subjects:</span>
              <span className="text-[#16151C] font-medium">
                {selectedLink?.subjects?.join(", ") || "N/A"}
              </span>

              <span className="text-[#16151C] font-light">Assignments:</span>
              <span className="text-[#16151C] font-medium">
                {selectedLink?.assignments?.join(", ") || "N/A"}
              </span>

              <span className="text-[#16151C] font-light">Curricula:</span>
              <span className="text-[#16151C] font-medium">
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
                    width: 215,
                    height: 50,
                    borderRadius: "8px",
                    borderColor: "#4071B6",
                    backgroundColor: "#4071B60D",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#4071B6",
                    textTransform: "none",
                    padding: 0,
                    "&:hover": {
                      borderColor: "#4071B6",
                      backgroundColor: "#F0F4FA",
                    },
                  }}
                >
                  <span className="flex items-center gap-2">
                    Download Resume
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L12 15M12 15L15 12M12 15L12 3" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M7.5 9L7 9C4.79086 9 3 10.7909 3 13L3 17C3 19.2091 4.79086 21 7 21L17 21C19.2091 21 21 19.2091 21 17L21 13C21 10.7909 19.2091 9 17 9L16.5 9" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
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
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "#A81E1E",
                    borderColor: "#A81E1E",
                    textTransform: "none",
                    padding: 0,
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
        <div className="mt-6 flex items-center justify-center px-4 py-3 bg-white">
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Previous button */}
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              sx={{ minWidth: '32px', padding: '4px' }}
            >
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                  fill="#16151C"
                />
              </svg>
            </Button>

            {/* Page numbers */}
            {getVisiblePages(currentPage, Math.ceil(tutors?.length / itemsPerPage), 4).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                sx={{
                  width: page === currentPage ? 35 : 32,
                  minWidth: 'unset',
                  height: 36,
                  borderRadius: page === currentPage ? '8px' : '50px',
                  padding: '7px 12px',
                  gap: '10px',
                  borderWidth: page === currentPage ? 1 : 0,
                  border: page === currentPage ? '1px solid #4071B6' : 'none',
                  background: '#FFFFFF',
                  color: page === currentPage ? '#4071B6' : '#16151C',
                  fontWeight: page === currentPage ? 600 : 300,
                  fontSize: '14px',
                }}
              >
                {page}
              </Button>
            ))}

            {/* Next button */}
            <Button
              disabled={currentPage === Math.ceil(tutors?.length / itemsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
              sx={{ minWidth: '32px', padding: '4px' }}
            >
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                  fill="#16151C"
                />
              </svg>
            </Button>
          </Stack>
        </div>
      )}
    </div>
  );
};

export default ProcessedTutorForm;
