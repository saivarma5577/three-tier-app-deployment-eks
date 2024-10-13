const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./models/item'); // Ensure this path is correct

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/itemDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// POST route to add an item
app.post('/api/items', async (req, res) => {
    try {
        console.log('Received item:', req.body);
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        console.log('Saved item:', savedItem);
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Error adding item', error: error.message });
    }
});

// GET route to fetch items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        console.log('Fetched items:', items);
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
