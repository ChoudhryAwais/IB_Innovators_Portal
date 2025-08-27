
import React from "react"
import classes from "./TopHeading.module.css";

export default function TopHeading({children}){

    return(
        <div
        style={{
          marginTop: "0px",
          flex: 1,
          height: "max-content",marginRight: '10px',
          marginBottom: '10px',
        }}
       >
          <div className={classes.heading} >
          {children}
        </div>
      </div>
    )
}