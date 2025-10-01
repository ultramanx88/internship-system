export default function SimpleTestPage() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Simple Test Page</h1>
            <p>If you can see this, the basic Next.js routing works.</p>
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <h2>Debug Info:</h2>
                <p>Time: {new Date().toLocaleString()}</p>
                <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
            </div>
        </div>
    );
}