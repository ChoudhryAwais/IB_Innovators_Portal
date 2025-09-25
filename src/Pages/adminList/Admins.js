"use client"

import React, { useEffect, useState } from "react"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faUserShield } from "@fortawesome/free-solid-svg-icons"
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

  return (
    <TopHeadingProvider>
      <div className="p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-7">
          {admins.length !== 0 && (
            <div className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon className="text-gray-400" icon={faMagnifyingGlass} />
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
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FontAwesomeIcon icon={faUserShield} className="text-white" />
                      </div>
                      {/* Name */}
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {admin?.userName}
                      </h3>
                    </div>

                    {/* Email + ID */}
                    <div className="text-sm text-gray-600 mt-1 pl-[4rem]">
                      <div className="flex">
                        <span className="w-24">Email: </span>
                        <span className="text-gray-800">{admin?.email}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24">Admin ID: </span>
                        <span className="text-gray-800">{admin?.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    <Button
                      variant="contained"
                      className="ml-4 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      style={{ backgroundColor: "#4071B6", textTransform: "none" }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {searchedAdmins?.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, searchedAdmins.length)} of{" "}
                {searchedAdmins.length} records
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(searchedAdmins?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                />
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
