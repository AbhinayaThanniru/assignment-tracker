import React, { useEffect, useState } from "react";

// In Kubernetes, use the Minikube IP or Port-Forwarding address
const API = "http://localhost:5000"; 

function App() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API}/assignments`);
      const data = await res.json();
      setAssignments(data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const addAssignment = async (e) => {
    e.preventDefault(); // CRITICAL: Stops the page refresh
    if (!title || !dueDate) return;

    await fetch(`${API}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_date: dueDate })
    });

    setTitle("");
    setDueDate("");
    fetchAssignments();
  };

  const completeAssignment = async (id) => {
    await fetch(`${API}/assignments/${id}/complete`, { method: "PUT" });
    fetchAssignments();
  };

  const deleteAssignment = async (id) => {
    await fetch(`${API}/assignments/${id}`, { method: "DELETE" });
    fetchAssignments();
  };

  const editAssignment = async (id) => {
    const newTitle = prompt("Enter new title:");
    if (!newTitle) return;
    await fetch(`${API}/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    });
    fetchAssignments();
  };

  const completed = assignments.filter(a => a.status === "completed").length;
  const progress = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);
  const sorted = [...assignments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Assignment Submission Tracker</h1>
      <form onSubmit={addAssignment}>
        <input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <h3>Progress: {progress}%</h3>
      <div style={{ height: 20, background: "#ddd", marginBottom: 20, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "green" : progress > 50 ? "orange" : "red", transition: '0.3s' }} />
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const overdue = new Date(a.due_date) < new Date() && a.status !== "completed";
            return (
              <tr key={a.id} style={{ background: overdue ? "#ffcccc" : "white" }}>
                <td>{a.title}</td>
                <td>{new Date(a.due_date).toLocaleDateString()}</td>
                <td>{a.status}</td>
                <td>
                  <button onClick={() => completeAssignment(a.id)}>Complete</button>
                  <button onClick={() => editAssignment(a.id)}>Edit</button>
                  <button onClick={() => deleteAssignment(a.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;