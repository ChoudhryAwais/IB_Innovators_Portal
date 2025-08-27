import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Logo from "../../images/IBI/IBILogo.png";


import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';

export function TopSearch({setSearch}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",
        paddingTop: '0px',
        paddingBottom: '10px',
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
        }}>
<div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
<img src={Logo} style={{height: '100%', width: 'auto', maxWidth: '200px'}} alt="SomeImage" />
</div>
        


        <div style={{marginBottom: '10px', marginTop: '20px', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', borderBottom: '2px solid #ccc'}}>
        <FontAwesomeIcon style={{marginLeft: '10px', marginRight: '10px'}} icon={faMagnifyingGlass} />
        <input placeholder="Search" 
        onChange={(e) => {setSearch(e.target.value)}}
  style={{ border: 'none', flex: 1, outline: 'none', background: 'transparent' }} />
        </div>
      </div>

    </div>
  );
}
