import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../Context/MyContext";
import { useContext } from "react";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import DefaultBlogs from "./DefaultBlogs";
import { Typography } from "@mui/material";

export function SearchBlogs({ search, blogs, loading }) {

  let filteredData = blogs?.filter((pkg) =>
    pkg.header.toLowerCase().includes(search.toLowerCase())
  );

  // PAST LESSONS PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = filteredData?.slice(startIndex, endIndex);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",
        marginRight: "10px",
        marginBottom: "20px",
      }}
    >
      <div
        className="shadowAndBorder"
        style={{
          marginTop: "0px",
          flex: 1,
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {loading ? (
          <div
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginBottom: "20px",
              marginTop: "20px",
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          search ?
          <>
            {filteredData.length === 0 ? (
              <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50px'}}>
              <Typography variant="body1" style={{ padding: "10px", fontWeight: 'bolder', fontSize: '1.5rem', color: 'rgba(158,158,158, 0.5)' }}>
                No blogs found
              </Typography>
              </div>
            ) : (
              <>
                {displayedSessions.map((pkg, index) => (
                  <section key={pkg.id}>
                    <Link to={`/supportAndTraining/${pkg.id}`}>
                      <div
                        style={{
                          borderTop: index !== 0 ? "2px solid #ccc" : "none",
                          padding: "10px",
                        }}
                      >
                        <div>{pkg.header}</div>
                      </div>
                    </Link>
                  </section>
                ))}
              </>
            )}

            {filteredData?.length > itemsPerPage && (
              <div
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(filteredData?.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handleChangePage}
                  />
                </Stack>
              </div>
            )}
          </>
          :
          <DefaultBlogs blogs={blogs} />
        )}
      </div>
    </div>
  );
}
