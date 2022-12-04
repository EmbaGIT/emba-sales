import React, { useEffect, useState } from 'react'
import { get } from '../../api/Api'
import { getHost } from '../../helpers/host'
import { NavLink } from 'react-router-dom'
import Loader from 'react-loader-spinner'

const AnnouncementList = () => {
    const [activeAnnouncements, setActiveAnnouncements] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        get(`${getHost('announcement', 8093)}/api/announcement`)
            .then(data => setActiveAnnouncements(data.content.filter(campaign => campaign.status === 'ACTIVE')))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className="row">
            { isLoading
                ? <div className='w-100 d-flex justify-content-center'>
                    <Loader
                        type="ThreeDots"
                        color="#00BFFF"
                        height={60}
                        width={60}
                    />
                </div>
                : null
            }
            { !isLoading && error ? <h4 className='text-danger'>{error}</h4> : null }
            { (!isLoading && activeAnnouncements.length) ? activeAnnouncements.map(announcement => (
                <div className="col-lg-3 col-md-4 col-sm-12 announcement__list" key={announcement.id}>
                    <div className="border-5 rounded overflow-hidden shadow-lg announcement__list-item">
                        <div className="announcement__list-img">
                            <img src={announcement.file?.url} />
                        </div>
                        <div className="announcement__list-info p-3">
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
            )) : null }
        </div>
    )
}

export default AnnouncementList