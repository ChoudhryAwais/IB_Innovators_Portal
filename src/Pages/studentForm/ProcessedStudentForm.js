import React, { useState, useEffect } from "react";
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

const ProcessedStudentForm = () => {
  const [studentData, setStudentData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedStudentForm");
    const orderCollectionRef = collection(customDocRef, "processedStudentForm");

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"));

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        setStudentData(fetchedData);
      },
      (error) => {
        toast.error("Error fetching data");
      }
    );

    return () => unsubscribe();
  };

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true);
      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "processedStudentForm");
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedStudentForm");

      const studentDocRef = doc(prevOrderCollectionRef, student.id);
      await deleteDoc(studentDocRef);

      setShowModal(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Error deleting student form");
      console.error("Error deleting student form: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = studentData?.slice(startIndex, endIndex);

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
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full">
      <div className="mb-6 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#16151C]">Processed Forms</h2>
        <span className="text-sm text-[#16151C]">
          {String(studentData?.length).padStart(2, "0")} Forms
        </span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((student, index) => (
          <ListItemButton
            key={index}
            onClick={() => {
              setSelectedLink(student);
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
                {student?.userDetails?.firstName} {student?.userDetails?.lastName}
              </span>
              <span className="text-sm text-[#16151C]">
                {student?.userDetails?.email || "N/A"}
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
          </ListItemButton>
        ))}
      </div>

      {studentData?.length === 0 && (
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
              maxWidth: "1200px",
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
                Processed Forms{" "}
                <span className="font-light text-lg">(Student Inquiry)</span>
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

            <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />


            {/* ---------------- Section 1 ---------------- */}
            {selectedLink?.type === "new" ? (
              <>
                {/* Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-b border-gray-200 pb-6">
                  {/* Column 1 */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <span className="text-[#16151C]">Program:</span>
                    <span className="font-semibold">{selectedLink?.program || "N/A"}</span>

                    <span className="text-[#16151C]">Class:</span>
                    <span className="font-semibold">{selectedLink?.class || "N/A"}</span>

                    <span className="text-[#16151C]">Subjects:</span>
                    <div className="font-semibold space-y-1">
                      {selectedLink?.selectedSubjects?.map((sub, i) => (
                        <div key={i}>{sub}</div>
                      ))}
                    </div>

                    <span className="text-[#16151C]">Tutoring Support:</span>
                    <span className="font-semibold">{selectedLink?.tutoringSupport || "N/A"}</span>

                    <span className="text-[#16151C]">Package:</span>
                    <span className="font-semibold">{selectedLink?.package || "N/A"}</span>

                    <span className="text-[#16151C]">Hours:</span>
                    <span className="font-semibold">{selectedLink?.hours || "N/A"}</span>
                  </div>

                  {/* Column 2 */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <span className="text-[#16151C]">Lesson Dates:</span>
                    <div className="font-semibold space-y-1">
                      {selectedLink?.lessonDates?.map((date, i) => (
                        <div key={i}>{date}</div>
                      ))}
                    </div>

                    <span className="text-[#16151C]">Time Zone:</span>
                    <span className="font-semibold">{selectedLink?.timeZone || "N/A"}</span>

                    <span className="text-[#16151C]">Support Needed:</span>
                    <span className="font-semibold">
                      {selectedLink?.guidanceAndSupport?.needed ? "Yes" : "No"}
                    </span>

                    <span className="text-[#16151C]">Total Cost:</span>
                    <span className="font-semibold">£ {selectedLink?.totalCost || "N/A"}</span>

                    <span className="text-[#16151C]">Cost After Support:</span>
                    <span className="font-semibold">
                      £ {selectedLink?.totalCostAfterGuidanceAndSupport || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Guidance & Support Details */}
                {selectedLink?.guidanceAndSupport?.needed && (
                  <div className="mt-8 border-b border-gray-200 pb-6">
                    <h3 className="font-bold text-[#16151C] mb-4">
                      Guidance & Support Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-[#16151C] w-44">Assignment Types:</span>
                          <span className="font-semibold">
                            {selectedLink?.guidanceAndSupport?.assignmentType?.join(", ") || "N/A"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-[#16151C] w-44">Query:</span>
                          <span className="font-semibold">
                            {selectedLink?.guidanceAndSupport?.query || "N/A"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-[#16151C] w-44">Requested Hours:</span>
                          <span className="font-semibold">
                            {selectedLink?.guidanceAndSupport?.hours || "N/A"}
                          </span>
                        </div>
                      </div>
                      {/* <div className="space-y-2">
                                        
                                      </div> */}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Show all the "Other Plans" and Guidance form fields like in code2 */}
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-[#16151C]">Submission Date: </span>
                    <span className="font-semibold">{formatDateTime(selectedLink?.submittedAt)?.date}</span>
                  </div>
                  <div>
                    <span className="text-[#16151C]">Submission Time: </span>
                    <span className="font-semibold">{formatDateTime(selectedLink?.submittedAt)?.time}</span>
                  </div>
                  <div>
                    <span className="text-[#16151C]">Pricing Plan: </span>
                    <span className="font-semibold">{selectedLink?.chosenPricingPlan}</span>
                  </div>
                  {/* … repeat all details from code2 in the same styled layout */}
                </div>
              </>
            )}

            {/* ---------------- Footer Buttons ---------------- */}
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowModal(false)}
                variant="outlined"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  borderColor: "#D1D5DB",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                Back
              </Button>
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
        </CustomModal>
      )}


      {studentData?.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 py-3 bg-white">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, studentData.length)} out of{" "}
            {studentData.length} records
          </div>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(studentData?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
              color="primary"
              size="small"
            />
          </Stack>
        </div>
      )}

    </div>
  );
};

export default ProcessedStudentForm;
