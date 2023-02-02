import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from '../../api/Api'
import { getHost } from '../../helpers/host'
import Parser from 'html-react-parser'
import Loader from 'react-loader-spinner'

const AnnouncementItem = () => {
    const { id } = useParams()
    const [announcement, setAnnouncement] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        get(`${getHost('announcement', 8093)}/api/announcement/${id}`)
            .then(data => setAnnouncement(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div className='row announcement__item'>
            <div className='col-12'>
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
                {
                    (!isLoading && Object.keys(announcement).length) ? <div className='row'>
                        <div className='col-lg-6 col-md-6'>
                            <div className='announcement__item-img'>
                                <img src={announcement.file?.url} />
                            </div>
                        </div>
                        <div className='col-lg-6 col-md-6'>
                            <h1 className='announcement__item-title'>{announcement.title || 'Kampaniya adı mövcud' +
                                ' deyil'}</h1>
                            <h5 className='announcement__item-content'>
                                {announcement.description || 'Kampaniya məzmunu mövcud deyil'}
                            </h5>
                            <hr />
                            <div className='announcement__item-description'>
                                {
                                    announcement.content
                                        ? Parser(announcement.content)
                                        : 'Kampaniyanın ətraflı məzmunu yoxdur'
                                }
                            </div>
                        </div>
                    </div> : null
                }
            </div>
        </div>
    )
}

export default AnnouncementItem