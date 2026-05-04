require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conectare la MongoDB (înlocuiește string-ul de mai jos cu cel de la Atlas)
const uri = process.env.MONGO_URI;


mongoose.connect(uri)
  .then(() => console.log("Conectat la MongoDB Atlas!"))
  .catch(err => console.error("Eroare conectare: ", err));

// Schema pentru datele de temperatură
const sensorSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Test: trimite o valoare dummy la fiecare 5 secunde
setInterval(async () => {
    const dummy = new SensorData({ temperature: 20 + Math.random()*5, humidity: 50 + Math.random()*10 });
    await dummy.save();
    console.log("Date dummy salvate pentru test");
}, 5000);

// Ruta POST pentru ESP32
app.post('/api/data', async (req, res) => {
    const data = new SensorData(req.body);
    try {
        await data.save();
        console.log("Date salvate:", data);
        res.status(200).send("Data saved!");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ruta GET pentru React (ca să citească datele din bază)
app.get('/api/data', async (req, res) => {
    const data = await SensorData.find().sort({timestamp: -1}).limit(10);
    res.json(data);
});



app.listen(5000, () => console.log("Serverul rulează pe portul 5000"));