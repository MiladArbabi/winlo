export default function Home() {
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      background: '#F0F4F8'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#333' }}>WINLO Admin Dashboard</h1>
      <p style={{ fontSize: '1.5rem', color: '#555' }}>
        Manage warehouses, products & floor plans
      </p>
    </div>
  );
}

