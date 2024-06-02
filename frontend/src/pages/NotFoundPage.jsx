import React from "react";

const NotFoundPage = () => {
  localStorage.clear()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'revert',
      paddingTop: '10vh',
    }}>
      <h1 style={{ fontSize: '2.8rem', marginBottom: '20px' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem', color: '#888' }}>The requested page does not exist.</p>
    </div>
  );
};

export default NotFoundPage;
