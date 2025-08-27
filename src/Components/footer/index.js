import React from 'react'
import Logo from '../../images/IBI/IBILogo.png'
import './styles.css'
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigtePages = useNavigate()

  const noPointer = { cursor: 'pointer' };



  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigtePages(page)
  };

  return (
    <div style={{marginTop: 0}} className='footer'>
      <div className='row p-5'>
        <div className='col-lg-4'>
          <img src={Logo} alt="logo-error" width={"22%"} />
          <p className='description mt-3'>
            IB Innovators is an online education website where you
            can post subjects search teacher trusted institude.
          </p>
        </div>
        <div className='col-lg-4'>
          <p className='heading'>Quick Links</p>
          <p onClick={() => handlePageChange("comingSoon")} className="cursorPointer">About Us</p>
          <p>Terms & Conditions</p>
          <p style={noPointer} >Blog</p>
          <p onClick={() => handlePageChange("comingSoon")} className="cursorPointer">Contact Us</p>
        </div>
        <div className='col-lg-4'>
          <div className='upper-contact-us'>
            <p className='heading'>Contact Us</p>
            {/* <p className='address d-flex'>
              <LocationOnIcon />
              <p className='pl-2'>{contactUsData.length > 0 ? contactUsData[2].value : ""}</p>
            </p> */}
            <p className='d-flex'>
              <MailIcon />
              <p className='pl-2'>ibinnovators@outlook.com</p>
            </p>
          </div>
          {/* {socialMedia.length > 0 ? socialMedia[2].value:""} */}
          <div className='lower-contact-us'>
            <p className='heading'>Follow Us</p>
            <i className="fa-brands fa-facebook" style={noPointer}></i>
            <i className="fa-brands fa-twitter ps-3" style={noPointer}></i>
            <i className="fa-brands fa-instagram ps-3" style={noPointer}></i>
            <i className="fa-brands fa-youtube ps-3" style={noPointer}></i>
            <i className="fa-solid fa-play ps-3" style={noPointer}></i>
            {/* images twitter, facebook, etc*/}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer;