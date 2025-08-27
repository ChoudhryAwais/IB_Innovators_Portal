import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBlog } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";

export function JobBlogs() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        maxWidth: "800px",
        paddingTop: '0px',
        marginBottom: '20px',
        marginRight: '10px'
      }}
    >
       <div
      className="shadowAndBorder"
        style={{
          marginTop: "0px",
          flex: 1,
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px', 
          minWidth: '150px'
        }}
      >
        <div
          style={{
            fontSize: "1.7rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          <FontAwesomeIcon icon={faBlog} /> Lorem Ipsum
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
          odio a ligula cursus, in ultricies justo pharetra. Suspendisse
          potenti. Nulla facilisi. Proin quis risus vel odio ullamcorper
          vestibulum.
        </p>
        <Button style={{marginTop: '10px'}} variant="outlined"
          
        >
          READ MORE
        </Button>
      </div>

      <div
      className="shadowAndBorder"
        style={{
          marginTop: "0px",
          flex: 1,
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: 'rgba(255,255,255, 0.5)',
          backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
          WebkitBackdropFilter: 'blur(4px)', // For Safari support,
          padding: '10px',
          borderRadius: '10px', 
          minWidth: '150px'
        }}
      >
        <div
          style={{
            fontSize: "1.7rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          <FontAwesomeIcon icon={faBlog} /> Lorem Ipsum
        </div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
          odio a ligula cursus, in ultricies justo pharetra. Suspendisse
          potenti. Nulla facilisi. Proin quis risus vel odio ullamcorper
          vestibulum.
        </p>
        <Button style={{marginTop: '10px'}} variant="outlined"
          
        >
          READ MORE
        </Button>
      </div>


    </div>
  );
}
