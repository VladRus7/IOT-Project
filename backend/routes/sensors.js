const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Sensor = require('../models/Sensor');

router.post('/add', auth, async (req, res) => {
  const { sensorId, name } = req.body;
  try {
    let sensor = await Sensor.findOne({ sensorId });
    if (!sensor) {
      sensor = new Sensor({ sensorId, name });
      await sensor.save();
    }

    const user = await User.findById(req.user.id);
    if (user.sensors.includes(sensorId)) {
      return res.status(400).json({ msg: 'Sensor already registered to your account' });
    }

    user.sensors.push(sensorId);
    await user.save();
    res.json(user.sensors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.sensors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;