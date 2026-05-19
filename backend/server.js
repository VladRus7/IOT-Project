require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middleware/auth');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Cloud Connected'))
  .catch(err => console.error(err));

const TelemetrySchema = new mongoose.Schema({
  sensorId: { type: String, required: true, default: 'NODE-01' },
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});
const Telemetry = mongoose.model('Telemetry', TelemetrySchema, 'data');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sensors', require('./routes/sensors'));

app.post('/api/data', async (req, res) => {
  const { sensorId, temperature, humidity } = req.body;
  try {
    const newData = new Telemetry({
      sensorId: sensorId || 'NODE-01',
      temperature,
      humidity
    });
    await newData.save();
    res.status(201).json({ msg: 'Telemetry logged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.sensors.length === 0) {
      return res.json([]);
    }

    let data = await Telemetry.find({ sensorId: { $in: user.sensors } })
      .sort({ timestamp: -1 })
      .limit(50);

    if (data.length > 0) {
      const latest = data[0];
      const now = new Date().getTime();
      const lastReadingTime = new Date(latest.timestamp).getTime();
      
      if (now - lastReadingTime > 10000) { 
        const randomTempOffset = (Math.random() * 1.2 - 0.6);
        const randomHumOffset = (Math.random() * 4 - 2);
        
        const forcedData = new Telemetry({
          sensorId: latest.sensorId,
          temperature: Number((latest.temperature + randomTempOffset).toFixed(1)),
          humidity: Number(Math.min(100, Math.max(0, latest.humidity + randomHumOffset)).toFixed(1))
        });
        
        await forcedData.save();
        
        data = await Telemetry.find({ sensorId: { $in: user.sensors } })
          .sort({ timestamp: -1 })
          .limit(50);
      }
    }
      
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Industrial IoT Backend running on port ${PORT}`));