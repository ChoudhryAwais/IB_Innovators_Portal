import NavBar from "./navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { useState } from "react";
import { useEffect } from "react";


export default function Layout(){

    
  const [marginLeft, setMarginLeft] = useState("90px");

  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setMarginLeft("90px");
    } else {
      setMarginLeft("240px");
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


    return(
        <div style={{maxWidth: '2200px', margin: '0px auto'}}>
            <NavBar />
            
        <div
          className="main-content"
          style={{
            marginLeft: marginLeft,
            marginTop: "90px",
          }}
        >
        <Sidebar />
      <Outlet />
        </div>
        </div>
    )
}