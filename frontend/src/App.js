import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('http://localhost:5000/api/data');
        setData(result.data.reverse()); // Cele mai noi la sfârșit
      } catch (err) {
        console.error("Eroare la preluarea datelor:", err);
      }
    };
    
    // Polling: întrebăm serverul la fiecare 2 secunde
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperatură (°C)',
        data: data.map(d => d.temperature),
        borderColor: '#FF5733',
        tension: 0.1
      },
      {
        label: 'Umiditate (%)',
        data: data.map(d => d.humidity),
        borderColor: '#33FF57',
        tension: 0.1
      }
    ]
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>IoT Sensor Dashboard</h1>
      {data.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p>Aștept date de la server... (Asigură-te că serverul rulează!)</p>
      )}
    </div>
  );
}

export default App;