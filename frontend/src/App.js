// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/items`, newItem);
      setNewItem({ name: '', description: '' });
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Item App</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            placeholder="Item name"
            required
          />
          <input
            type="text"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            placeholder="Item description"
            required
          />
          <button type="submit">Add Item</button>
        </form>
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              {item.name} - {item.description}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
