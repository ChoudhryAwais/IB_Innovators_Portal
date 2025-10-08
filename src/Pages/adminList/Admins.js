"use client"

import React, { useEffect, useState } from "react"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons"
import { db } from "../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

export const Admins = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Admins")
    setSecondMessage("Show all Admins")
  }, [setFirstMessage, setSecondMessage])

  const [admins, setAdmins] = useState([])
  const [searchedAdmins, setSearchedAdmins] = useState([])

  useEffect(() => {
    let unsubscribe

    const fetchData = async () => {
      try {
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("type", "==", "admin"))

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const adminData = querySnapshot.docs.map((doc) => doc.data())
          setAdmins(adminData)
          setSearchedAdmins(adminData)
        })
      } catch (e) {
        console.error("Error fetching admins:", e)
      }
    }

    fetchData()

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") unsubscribe()
    }
  }, [])

  function handleSearch(e) {
    const searchedData = e.target.value.toLowerCase()

    if (searchedData.length >= 2) {
      setSearchedAdmins(
        admins.filter((item) => {
          return (
            item?.userName?.toLowerCase().includes(searchedData) ||
            item?.email?.toLowerCase().includes(searchedData) ||
            item?.userId?.toLowerCase().includes(searchedData)
          )
        })
      )
    } else {
      setSearchedAdmins(admins)
    }
  }

  // pagination
  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const handleChangePage = (event, newPage) => setCurrentPage(newPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedAdmins = searchedAdmins?.slice(startIndex, endIndex)

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

  const visiblePages = getVisiblePages(currentPage, Math.ceil(searchedAdmins.length / itemsPerPage));

  return (
    <TopHeadingProvider>
      <div className="p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-7">
          {admins.length !== 0 && (
            <div className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-[21.5px] h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
                    viewBox="0 0 22 22"
                    fill="#16151C"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.75 10.5C1.75 15.3325 5.66751 19.25 10.5 19.25C15.3325 19.25 19.25 15.3325 19.25 10.5C19.25 5.66751 15.3325 1.75 10.5 1.75C5.66751 1.75 1.75 5.66751 1.75 10.5ZM10.5 20.75C4.83908 20.75 0.25 16.1609 0.25 10.5C0.25 4.83908 4.83908 0.25 10.5 0.25C16.1609 0.25 20.75 4.83908 20.75 10.5C20.75 13.0605 19.8111 15.4017 18.2589 17.1982L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L17.1982 18.2589C15.4017 19.8111 13.0605 20.75 10.5 20.75Z"
                    />
                  </svg>
                </div>
                <input
                  onChange={handleSearch}
                  placeholder="Search by name/email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                />
              </div>
            </div>
          )}

          <div className="overflow-hidden">
            {displayedAdmins.map((admin, index) => (
              <div key={index} className="flex items-stretch p-4 border-b border-gray-200">
                <div className="flex justify-between w-full">
                  {/* Admin Info */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-[#4071B6] rounded-[4px] flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden">
                        {admin?.image ? (
                          <img
                            src={admin.image}
                            alt={admin?.userName || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-white text-lg"
                          />
                        )}
                      </div>
                      {/* Name */}
                      <h3 className="font-semibold text-[#16151C] text-[18px]">
                        {admin?.userName}
                      </h3>
                    </div>

                    {/* Email + ID */}
                    <div className="text-sm text-[#16151C] mt-1 pl-[4rem]">
                      <div className="flex">
                        <span className="w-24 font-light">Email: </span>
                        <span className="font-medium">{admin?.email}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 font-light">Admin ID: </span>
                        <span className="font-medium">{admin?.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    <Button
                      variant="contained"
                      className="ml-4 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      style={{
                        borderRadius: "8px",
                        width: "130px",
                        height: "40px",
                        color: "#FFFFFF",
                        backgroundColor: "#4071B6",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {searchedAdmins?.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white">
              <div className="text-[14px] font-light text-[#A2A1A8]">
                Showing {startIndex + 1} to {Math.min(endIndex, searchedAdmins.length)} out of {searchedAdmins.length} records
              </div>

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
                {getVisiblePages(currentPage, Math.ceil(searchedAdmins.length / itemsPerPage), 4).map((page) => (
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
                  disabled={currentPage === Math.ceil(searchedAdmins.length / itemsPerPage)}
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

          {searchedAdmins.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-xl">No Admins Found</div>
            </div>
          )}
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default Admins
