const Footer = () => (
    <footer className='container-fluid bg-light py-3'>
        <div className='row'>
            <div className='col-12'>
                <div className='text-center'>Emba Sale 2021 | Embawood &copy; </div>
            </div>
        </div>
        <div className="wish-box-wrapper">
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScHrcGmyFuc3yPaEpCIRobO0HBQrIEs0HecjXuJWv-h56i6LA/viewform"
               target="_blank" rel="noreferrer">
                <div className="wish-box-mobile">
                    <div>
                        <div className="wish-box">
                            <span>İstəklər Qutusu</span>
                        </div>
                        <div className="rings">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        <div className="wish-box-wrapper position2">
            <a href="https://bit.ly/3xLtsy8" target="_blank" rel="noreferrer">
                <div className="wish-box-mobile">
                    <div>
                        <div className="wish-box">
                            <span>İstəklərə cavab</span>
                        </div>
                        <div className="rings">
                            <div className="ring"></div>
                            <div className="ring"></div>
                            <div className="ring"></div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </footer>
);

export default Footer;