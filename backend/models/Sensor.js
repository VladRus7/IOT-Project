const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'DHT22' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', SensorSchema);