const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const dataFile = path.join(__dirname, 'data.json');

app.use(express.json());

// Utility function to read the JSON file
async function readFile() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Utility function to write to the JSON file
async function writeFile(data) {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

// Create
app.post('/items', async (req, res) => {
    try {
        const data = await readFile();
        const newItem = {
            id: Date.now().toString(),
            ...req.body
        };
        data.push(newItem);
        await writeFile(data);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Error creating item' });
    }
});

// Read (all items)
app.get('/items', async (req, res) => {
    try {
        const data = await readFile();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error reading items' });
    }
});

// Read (single item)
app.get('/items/:id', async (req, res) => {
    try {
        const data = await readFile();
        const item = data.find(item => item.id === req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error reading item' });
    }
});

// Update
app.put('/items/:id', async (req, res) => {
    try {
        const data = await readFile();
        const index = data.findIndex(item => item.id === req.params.id);
        if (index !== -1) {
            data[index] = { ...data[index], ...req.body, id: req.params.id };
            await writeFile(data);
            res.json(data[index]);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating item' });
    }
});

// Delete
app.delete('/items/:id', async (req, res) => {
    try {
        const data = await readFile();
        const filteredData = data.filter(item => item.id !== req.params.id);
        if (data.length !== filteredData.length) {
            await writeFile(filteredData);
            res.json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting item' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});