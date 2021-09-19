import React from 'react';
import Footer from './Footer';
import Header from './Header';

const Layout = (props) => {
    return (
        <React.Fragment>
            <Header menuData={props.menuData}/>
            <section className='content d-flex flex-column flex-column-fluid py-3'
                     style={{minHeight: 'calc(100vh - 120px)'}}>
                <div className='container-fluid'>
                    {props.children}
                </div>
            </section>
            <Footer/>
        </React.Fragment>
    )
};

export default Layout;