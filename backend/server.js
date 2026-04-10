const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'user',
  host: process.env.DB_HOST || 'db-service', // 'db-service' is the K8s service name
  database: process.env.DB_NAME || 'assignments',
  password: process.env.DB_PASSWORD || 'pass',
  port: 5432,
});

// GET all assignments
app.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new assignment
app.post('/assignments', async (req, res) => {
  const { title, due_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO assignments (title, due_date, status) VALUES ($1, $2, $3) RETURNING *',
      [title, due_date, 'pending']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update status to complete
app.put('/assignments/:id/complete', async (req, res) => {
  try {
    await pool.query('UPDATE assignments SET status = $1 WHERE id = $2', ['completed', req.params.id]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit title
app.put('/assignments/:id', async (req, res) => {
  try {
    await pool.query('UPDATE assignments SET title = $1 WHERE id = $2', [req.body.title, req.params.id]);
    res.json({ message: "Updated title" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE assignment
app.delete('/assignments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));