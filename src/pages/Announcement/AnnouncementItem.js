import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from '../../api/Api'
import { getHost } from '../../helpers/host'
import Parser from 'html-react-parser'

const AnnouncementItem = () => {
    const { id } = useParams()
    const [announcement, setAnnouncement] = useState({})

    useEffect(() => {
        get(`${getHost('announcement', 8093)}/api/announcement/${id}`)
            .then(data => setAnnouncement(data))
            .catch(err => console.log(err))
    }, [])

    return (
        <div className='row'>
            <div className='col-12'>
                <img
                    style={{
                        height: '320px',
                        width: '100%',
                        objectFit: 'cover'
                    }}
                    src={announcement.file.url}
                />
                <h1>{announcement.title || 'Kampaniya adı mövcud deyil'}</h1>
                <p>
                    <strong>{announcement.content || 'Kampaniya məzmunu mövcud deyil'}</strong>
                </p>
                <div>
                    {
                        announcement.description
                            ? Parser(announcement.description)
                            : 'Kampaniyanın ətraflı məzmunu yoxdur'
                    }
                </div>
            </div>
        </div>
    )
}

export default AnnouncementItem