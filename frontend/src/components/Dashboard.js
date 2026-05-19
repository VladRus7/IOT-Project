import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Thermometer, Wifi, WifiOff, Cpu, ShieldAlert, Download, Table, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import 'chart.js/auto';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const FIVE_MINUTES_MS = 300000;
  const TEMP_OFFSET = 3.0;
  const TEMP_MIN = 18.0;
  const TEMP_MAX = 28.0;

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const result = await axios.get('http://localhost:5000/api/data');
      const docs = result.data;
      
      if (docs && Array.isArray(docs) && docs.length > 0) {
        const calibratedDocs = docs.map(d => ({
          ...d,
          temperature: typeof d.temperature === 'number' ? d.temperature - TEMP_OFFSET : d.temperature
        }));

        const sortedData = [...calibratedDocs].reverse();
        setData(sortedData);
        
        const latest = calibratedDocs[0]; 
        
        if (latest && latest.timestamp) {
          const lastReadingTime = new Date(latest.timestamp).getTime();
          const now = new Date().getTime();
          setIsOnline(now - lastReadingTime < FIVE_MINUTES_MS); 
        }

        if (latest && typeof latest.temperature === 'number') {
          if (latest.temperature > TEMP_MAX) {
            setAlertMessage(`Critical Alert: High temperature detected (${latest.temperature.toFixed(1)}°C)! Threshold: >${TEMP_MAX}°C`);
          } else if (latest.temperature < TEMP_MIN) {
            setAlertMessage(`Critical Alert: Low temperature detected (${latest.temperature.toFixed(1)}°C)! Threshold: <${TEMP_MIN}°C`);
          } else {
            setAlertMessage(null); 
          }
        }
      }
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 600);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setIsOnline(false);
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, FIVE_MINUTES_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const latestReading = data.length > 0 ? data[data.length - 1] : { temperature: 0, humidity: 0 };
  
  const isTooHot = latestReading.temperature > TEMP_MAX;
  const isTooCold = latestReading.temperature < TEMP_MIN;
  const isTempAlert = isTooHot || isTooCold;

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = ["Timestamp", "Temperature (C)", "Humidity (%)"];
    const rows = [...data].reverse().map(d => [
      d.timestamp ? new Date(d.timestamp).toLocaleString() : 'N/A',
      d.temperature ? d.temperature.toFixed(1) : '0.0',
      d.humidity ? d.humidity.toFixed(1) : '0.0'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  const styles = {
    container: { padding: '24px', backgroundColor: '#111827', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #1f2937', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' },
    titleSection: { flex: 1 },
    title: { fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
    subtitle: { color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' },
    controlsSection: { display: 'flex', alignItems: 'center', gap: '12px' },
    btnRefresh: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' },
    badgeOnline: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
    badgeOffline: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', fontSize: '14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    alertBanner: { marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(127, 29, 29, 0.4)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' },
    card: { padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgba(55, 65, 81, 0.6)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', transition: 'all 0.3s ease' },
    cardAlertHot: { padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(127, 29, 29, 0.2)', border: '2px solid #ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)', transition: 'all 0.3s ease' },
    cardAlertCold: { padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(30, 58, 138, 0.15)', border: '2px solid #3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' },
    tagReal: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8', backgroundColor: 'rgba(49, 46, 129, 0.6)', padding: '4px 8px', borderRadius: '6px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { color: '#9ca3af', fontSize: '14px', fontWeight: '500', margin: 0 },
    valueContainer: { display: 'flex', alignItems: 'baseline', gap: '24px', marginTop: '8px' },
    bigValue: { fontSize: '42px', fontWeight: '900', color: '#ffffff' },
    unit: { fontSize: '18px', color: '#9ca3af', marginLeft: '4px' },
    statusFooter: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(75, 85, 99, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    hotErrorText: { fontSize: '12px', fontWeight: '800', color: '#f87171', backgroundColor: 'rgba(220, 38, 38, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(220, 38, 38, 0.4)' },
    coldErrorText: { fontSize: '12px', fontWeight: '800', color: '#60a5fa', backgroundColor: 'rgba(29, 78, 216, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(29, 78, 216, 0.4)' },
    normalText: { fontSize: '12px', fontWeight: '800', color: '#4ade80', padding: '4px 8px' },
    chartContainer: { padding: '24px', backgroundColor: 'rgba(31, 41, 55, 0.4)', border: '1px solid #1f2937', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', marginBottom: '32px' },
    historyContainer: { padding: '24px', backgroundColor: 'rgba(31, 41, 55, 0.4)', border: '1px solid #1f2937', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' },
    historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    historyTitle: { fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
    btnExport: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s' },
    tableWrapper: { overflowX: 'auto', maxHeight: '300px', borderRadius: '8px', border: '1px solid #1f2937' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    th: { backgroundColor: '#1f2937', padding: '12px 16px', color: '#9ca3af', fontWeight: '600', position: 'sticky', top: 0, zIndex: 1 },
    td: { padding: '12px 16px', borderBottom: '1px solid #1f2937', color: '#e5e7eb' }
  };

  let cardStyle = styles.card;
  if (isTooHot) cardStyle = styles.cardAlertHot;
  if (isTooCold) cardStyle = styles.cardAlertCold;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111827', color: '#ffffff', fontFamily: 'sans-serif', fontWeight: '600' }}>
        <p>Initializing IoT Control Panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}><Cpu style={{ color: '#6366f1' }} />IoT Platform</h1>
          <p style={styles.subtitle}>Real-time monitoring system (5 min interval)</p>
        </div>
        
        <div style={styles.controlsSection}>
          <button 
            style={styles.btnRefresh} 
            onClick={handleManualRefresh}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
          >
            <RefreshCw 
              size={14} 
              style={{ 
                transition: isRefreshing ? 'none' : 'transform 0.2s',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} 
            />
            <span>Update Data</span>
          </button>
          
          <div style={isOnline ? styles.badgeOnline : styles.badgeOffline}>
            {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
            {isOnline ? "STATION ONLINE" : "STATION OFFLINE"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {alertMessage && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.alertBanner}>
          <ShieldAlert style={{ color: isTooHot ? '#f87171' : '#60a5fa' }} size={24} />
          <span>{alertMessage}</span>
        </motion.div>
      )}

      <div style={styles.grid}>
        <div style={cardStyle}>
          <div style={styles.cardHeader}>
            <span style={styles.tagReal}>Node 01 - Live Data</span>
            <Thermometer size={24} style={{ color: isTooHot ? '#ef4444' : (isTooCold ? '#3b82f6' : '#9ca3af') }} />
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

          <div style={styles.statusFooter}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>System Diagnostics:</span>
            {isTooHot && <span style={styles.hotErrorText}>[ ERROR: OVERHEATING ALERT ]</span>}
            {isTooCold && <span style={styles.coldErrorText}>[ ERROR: FREEZING ALERT ]</span>}
            {!isTempAlert && <span style={styles.normalText}>[ STATUS: NORMAL ]</span>}
          </div>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: 0, marginBottom: '16px' }}>Telemetry Analytical Trends</h3>
        <div style={{ height: '350px', position: 'relative' }}>
          <Line data={{
            labels: data.map(d => d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ''),
            datasets: [
              { label: 'Temperature (°C)', data: data.map(d => d.temperature || 0), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3 },
              { label: 'Humidity (%)', data: data.map(d => d.humidity || 0), borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 }
            ]
          }} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div style={styles.historyContainer}>
        <div style={styles.historyHeader}>
          <h3 style={styles.historyTitle}>
            <Table size={20} style={{ color: '#6366f1' }} /> Telemetry Log History
          </h3>
          <button style={styles.btnExport} onClick={exportToCSV}>
            <Download size={16} /> Export to CSV
          </button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Temperature</th>
                <th style={styles.th}>Humidity</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                [...data].reverse().map((d, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{d.timestamp ? new Date(d.timestamp).toLocaleString() : 'N/A'}</td>
                    <td style={{ ...styles.td, color: '#f87171', fontWeight: '600' }}>
                      {d.temperature ? `${d.temperature.toFixed(1)} °C` : '0.0 °C'}
                    </td>
                    <td style={{ ...styles.td, color: '#60a5fa', fontWeight: '600' }}>
                      {d.humidity ? `${d.humidity.toFixed(1)} %` : '0.0 %'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    No telemetry records stored yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}