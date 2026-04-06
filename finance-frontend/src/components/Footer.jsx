import React from 'react';

function Footer() {
    return (
        <footer style={{
            padding: '12px 20px',
            background: '#0f172a',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff',
            marginTop: 'auto',
            borderTop: '1px solid #ddd'
        }}>
            <p style={{ margin: 0 }}>© All rights are with Track Finance</p>
        </footer>
    );
}

export default Footer;
