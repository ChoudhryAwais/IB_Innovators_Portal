import React from 'react'
import './index.css'
// import { useNavigate } from 'react-router-dom';

export default function PlainHeroSection(props) {
    const { content, button, bgImage, btnCallBack } = props
    // const navigtePages = useNavigate()

    // handle change pages
    // const handleChange = (e, navValue) => {
    //     e.preventDefault()
    //     navigtePages(navValue)
    // };

    return (
        <div id="plainHeroSection">
            <div className="plainHeroSection-container">
                <div className={"bg-image " + bgImage}></div>
                <div className="heroSection-text-container">
                    <h1>
                        <b>{content}</b>
                    </h1>
                    <button
                        className='btn btn-lg btn btn-danger mt-4'
                        onClick={btnCallBack}
                    >
                        {button}
                    </button>
                </div>
            </div>
        </div>
    )
}
