import React from 'react'

const videos = [
    {
        link: 'https://www.youtube.com/embed/XWb_YDTzKZA',
        title: 'EmbaStore Telim Saticilar'
    },
    {
        link: 'https://www.youtube.com/embed/FxLvwBuCD6c',
        title: 'Emba.Store_Ucotcular_1C'
    }
]

const Instructions = () => {
    return (
        <div className='row'>
            {
                videos.map(video => (
                    <div className='col-lg-6 col-md-6 col-sm-12 instruction' key={video.link}>
                        <div className='instruction__video shadow-lg'>
                            <iframe
                                src={video.link}
                                title={video.title}
                                frameBorder="0"
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