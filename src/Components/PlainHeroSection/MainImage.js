import React from "react";
import Typewriter from "typewriter-effect";
import classes from "./MainImage.module.css";
import MainProduct from "../../assets/Product.png";
import { useNavigate } from "react-router-dom";

function MainImage() {
  const navigate = useNavigate();
  return (
    <div className={classes.mainImage}>
      <div className={classes.mainImageComponent}>
        <div className={classes.mainImageText}>
          <h2 className={classes.heading}>
            <Typewriter
              options={{
                strings: ["IB INNOVATORS"],
                autoStart: true,
                loop: true,
                delay: 100 // Delay between each character
              }}
            />
          </h2>
          <p className={classes.para}>
            Ace Your IBDP Exams with Certified IB Examiners
          </p>
          <button
            onClick={() => {
              navigate("/pricing");
            }}
            className={classes.mainButton}
          >
            Book a Tutor
          </button>
        </div>
      </div>
      <div className={classes.mainImageComponent}>
        <img
          src={MainProduct}
          alt="MainProduct"
          className={classes.mainProductImage}
        />
      </div>
    </div>
  );
}

export default MainImage;
