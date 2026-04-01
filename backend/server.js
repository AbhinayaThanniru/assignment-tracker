// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// GET all assignments
app.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assignments ORDER BY due_date ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD assignment
app.post('/assignments', async (req, res) => {
  const { title, due_date } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO assignments(title, due_date, status) VALUES($1, $2, $3) RETURNING *',
      [title, due_date, 'pending']
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE status to completed
app.put('/assignments/:id/complete', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE assignments SET status=$1 WHERE id=$2 RETURNING *',
      ['completed', id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE assignment
app.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM assignments WHERE id=$1',
      [id]
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});