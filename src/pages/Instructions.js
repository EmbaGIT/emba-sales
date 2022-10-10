import React from 'react'

const videoLinks = [
    'https://www.youtube.com/embed/XWb_YDTzKZA'
]

const Instructions = () => {
    return (
        <div className='row'>
            {
                videoLinks.map(link => (
                    <div className='col-lg-6 instruction' key={link}>
                        <div className='instruction__video shadow-lg'>
                            <iframe
                                src={link}
                                title="EmbaStore Telim Saticilar" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default Instructions