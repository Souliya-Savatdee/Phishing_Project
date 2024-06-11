

const Unauthorized = () => {

    // localStorage.clear();
  return (
    <section>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'revert',
      paddingTop: '10vh',
    }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '20px' }}>Unauthorized</h1>

        <p style={{ fontSize: '1.2rem', color: '#888' }}>You do not have access to the requested page.</p>

      </div>
    </section>
  );
};

export default Unauthorized;
