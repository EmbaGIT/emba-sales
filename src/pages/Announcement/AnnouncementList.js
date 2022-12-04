import React, { useEffect, useState } from 'react'
import { get } from '../../api/Api'
import { getHost } from '../../helpers/host'
import { NavLink } from 'react-router-dom'

const AnnouncementList = () => {
    const [activeAnnouncements, setActiveAnnouncements] = useState([])

    useEffect(() => {
        get(`${getHost('announcement', 8093)}/api/announcement`)
            .then(data => setActiveAnnouncements(data.content.filter(campaign => campaign.status === 'ACTIVE')))
            .catch(err => console.log(err))
    }, [])

    return (
        <div className="row">
            {activeAnnouncements.length && activeAnnouncements.map(announcement => (
                <div className="col-lg-3 col-md-4 col-sm-12 campaign" key={announcement.id}>
                    <div className="border-5 rounded overflow-hidden shadow-lg campaign__item">
                        <div className="campaign__img">
                            <img
                                width="100%"
                                src={announcement.file.url}
                            />
                        </div>
                        <div className="campaign__info p-3">
                            <h4>{announcement.title || 'Kampaniya adı mövcud deyil'}</h4>
                            <p className="mb-0 d-flex justify-content-between align-content-end">
                                {announcement.content || 'Kampaniya məzmunu mövcud deyil'}
                                <NavLink to={`announcements/${announcement.id}`}>
                                    <button className="btn btn-success px-2 py-1">
                                        Ətraflı
                                    </button>
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AnnouncementList