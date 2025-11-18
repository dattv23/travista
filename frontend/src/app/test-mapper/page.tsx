"use client";

import { useState } from 'react';

export default function TestMapperPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGetDirections = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Sending request to backend...');
      
      // Simple test: Seoul City Hall -> Gyeongbok Palace
      const response = await fetch('http://localhost:8080/api/mapper/get-directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: '126.9780,37.5665', // Seoul City Hall (lng,lat)
          goal: '126.9770,37.5796',   // Gyeongbok Palace (lng,lat)
          option: 'trafast'
        })
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        setResult(data.data);
        console.log('✅ Success!', data);
      } else {
        setError(data.message || 'Failed to get directions');
        console.error('❌ API Error:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      console.error('❌ Network Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '100px auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        marginBottom: '12px',
        color: '#333'
      }}>
        🧪 Test Mapper API
      </h1>
      
      <p style={{ 
        color: '#666', 
        marginBottom: '32px',
        fontSize: '16px'
      }}>
        Testing the <code style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '2px 6px', 
          borderRadius: '4px'
        }}>POST /api/mapper/get-directions</code> endpoint
      </p>

      <div style={{ marginBottom: '24px' }}>
        <strong>Test Route:</strong>
        <div style={{ marginTop: '8px', color: '#666' }}>
          📍 Start: Seoul City Hall (126.9780, 37.5665)<br/>
          📍 Goal: Gyeongbok Palace (126.9770, 37.5796)
        </div>
      </div>
      
      <button
        onClick={testGetDirections}
        disabled={loading}
        style={{
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: '600',
          backgroundColor: loading ? '#ccc' : '#5347AA',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '24px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#4338a0';
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#5347AA';
        }}
      >
        {loading ? '⏳ Loading...' : '🚀 Test Get Directions'}
      </button>

      {error && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #fcc'
        }}>
          <strong>❌ Error:</strong> {error}
          <div style={{ marginTop: '8px', fontSize: '14px' }}>
            Check the browser console (F12) for more details.
          </div>
        </div>
      )}

      {result && result.summary && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e8f5e9', 
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #a5d6a7'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            marginBottom: '16px',
            color: '#2e7d32'
          }}>
            ✅ Route Found Successfully!
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'white', 
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Distance</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {result.summary?.distance || 'N/A'}
              </div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'white', 
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Duration</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {result.summary?.duration || 'N/A'}
              </div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'white', 
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Toll Fare</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {result.summary?.tollFare?.toLocaleString() || 0} KRW
              </div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'white', 
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Taxi Fare</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {result.summary?.taxiFare?.toLocaleString() || 0} KRW
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '12px', 
            backgroundColor: 'white', 
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Path Points</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              {result.path?.length || 0} coordinates
            </div>
          </div>
        </div>
      )}

      {result && (
        <details style={{ marginTop: '24px' }}>
          <summary style={{ 
            cursor: 'pointer', 
            fontWeight: 'bold',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            userSelect: 'none'
          }}>
            📄 Show Full JSON Response (Click to expand)
          </summary>
          <pre style={{ 
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
            marginTop: '12px',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}

      <div style={{ 
        marginTop: '40px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>ℹ️ Instructions:</strong>
        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Make sure backend is running on <code>http://localhost:8080</code></li>
          <li>Click the "Test Get Directions" button above</li>
          <li>Check the browser console (F12) for detailed logs</li>
          <li>If successful, you'll see route details displayed</li>
        </ol>
      </div>
    </div>
  );
}

