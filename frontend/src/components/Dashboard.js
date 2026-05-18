import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Thermometer, Wifi, WifiOff, Cpu } from 'lucide-react';
import 'chart.js/auto';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // 5 minute în milisecunde = 5 * 60 * 1000 = 300,000 ms
  const FIVE_MINUTES_MS = 300000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('http://localhost:5000/api/data');
        const docs = result.data;
        
        if (docs && Array.isArray(docs) && docs.length > 0) {
          const sortedData = [...docs].reverse();
          setData(sortedData);
          
          const latest = docs[0]; 
          
          if (latest && latest.timestamp) {
            const lastReadingTime = new Date(latest.timestamp).getTime();
            const now = new Date().getTime();
            
            // Stația este Online dacă ultima citire s-a făcut în ultimele 5 minute
            setIsOnline(now - lastReadingTime < FIVE_MINUTES_MS); 
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setIsOnline(false);
        setLoading(false);
      }
    };

    fetchData();
    
    // Interfața verifică serverul la fiecare 5 minute
    const interval = setInterval(fetchData, FIVE_MINUTES_MS);
    return () => clearInterval(interval);
  }, []);

  const latestReading = data.length > 0 ? data[data.length - 1] : { temperature: 0, humidity: 0 };

  const chartData = {
    labels: data.map(d => d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ''),
    datasets: [
      { label: 'Temperature (°C)', data: data.map(d => d.temperature || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3 },
      { label: 'Humidity (%)', data: data.map(d => d.humidity || 0), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 }
    ]
  };

  const styles = {
    container: { padding: '24px', backgroundColor: '#111827', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' },
    titleSection: { flex: 1 },
    title: { fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
    subtitle: { color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' },
    badgeOnline: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
    badgeOffline: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' },
    card: { padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(55, 65, 81, 0.6)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' },
    tagReal: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8', backgroundColor: 'rgba(49, 46, 129, 0.6)', padding: '4px 8px', borderRadius: '6px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { color: '#9ca3af', fontSize: '14px', fontWeight: '500', margin: 0 },
    valueContainer: { display: 'flex', alignItems: 'baseline', gap: '24px', marginTop: '8px' },
    bigValue: { fontSize: '42px', fontWeight: '900', color: '#ffffff' },
    unit: { fontSize: '18px', color: '#9ca3af', marginLeft: '4px' },
    chartContainer: { padding: '24px', backgroundColor: 'rgba(31, 41, 55, 0.4)', border: '1px solid #1f2937', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111827', color: '#ffffff', fontFamily: 'sans-serif', fontWeight: '600' }}>
        <p>Initializing IoT Control Panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}><Cpu style={{ color: '#6366f1' }} /> IoT Platform</h1>
          <p style={styles.subtitle}>Real-time  monitoring system (5 min refresh)</p>
        </div>
        <div style={isOnline ? styles.badgeOnline : styles.badgeOffline}>
          {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
          {isOnline ? "STATION ONLINE" : "STATION OFFLINE"}
        </div>
      </div>

      {/* Sensor Grid - Only Real Sensor */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.tagReal}>Node 01 - Live Data</span>
            <Thermometer size={24} style={{ color: '#9ca3af' }} />
          </div>
          <h3 style={styles.cardTitle}>DHT22 Climate Sensor</h3>
          <div style={styles.valueContainer}>
            <div>
              <span style={styles.bigValue}>{(latestReading.temperature || 0).toFixed(1)}</span>
              <span style={styles.unit}>°C</span>
            </div>
            <div style={{ marginLeft: '10px' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#d1d5db' }}>{(latestReading.humidity || 0).toFixed(1)}</span>
              <span style={{ fontSize: '16px', color: '#6b7280', marginLeft: '4px' }}>% rH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartContainer}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: 0, marginBottom: '16px' }}>Telemetry Analytical Trends</h3>
        <div style={{ height: '350px', position: 'relative' }}>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}