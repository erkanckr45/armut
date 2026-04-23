export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚀 Armut Clone</h1>
      <p style={{ fontSize: '20px', color: '#666' }}>Platform hazır! Veritabanı kuruluyor...</p>
    </div>
  );
}