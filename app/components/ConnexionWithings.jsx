import React from 'react';

const ConnexionWithings = () => {
  const handleConnexion = () => {
    window.location.href = '/api/withings/login';
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={handleConnexion}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0072c6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Connecter mon compte Withings
      </button>
    </div>
  );
};

export default ConnexionWithings;
