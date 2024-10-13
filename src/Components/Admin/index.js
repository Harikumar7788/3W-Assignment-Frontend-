import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const Admin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null); // WebSocket state

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (Login)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://threewassignment-backend.onrender.com/api/register-admin', {
        username: formData.username,
        password: formData.password,
      });

      // If login is successful, store token and fetch user submissions
      const token = response.data.token;
      localStorage.setItem('token', token); // Store token in local storage

      setIsAuthenticated(true);
      setError('');
      fetchUsers(); // Fetch users after successful login
    } catch (error) {
      setError('Invalid username or password');
      setIsAuthenticated(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);  // Clear authenticated state
    setFormData({ username: '', password: '' });  // Reset form data
    setUsers([]);  // Clear user submissions
    if (socket) socket.close(); // Close WebSocket on logout
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const submissionsResponse = await axios.get('https://threewassignment-backend.onrender.com/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(submissionsResponse.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // WebSocket connection to receive new submissions
  useEffect(() => {
    if (isAuthenticated) {
      const ws = new WebSocket('wss://threewassignment-backend.onrender.com'); // Connect to WebSocket server
      setSocket(ws);

      ws.onmessage = (event) => {
        const newUser = JSON.parse(event.data);
        setUsers((prevUsers) => [...prevUsers, newUser]); // Add the new user to the list
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (ws) ws.close(); // Close WebSocket on component unmount
      };
    }
  }, [isAuthenticated]);

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="login-container">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="submit-btn">Login</button>
          </form>
        </div>
      ) : (
        <div className="dashboard-container">
          <h1>User Submissions Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>

          <div className="users-grid">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user._id} className="user-card">
                  <h3>{user.name}</h3>
                  <p>Social Media: @{user.socialMediaHandle}</p>
                  <div className="images-grid">
                    {user.images.map((image, index) => (
                      <a key={index} href={image.url} target="_blank" rel="noopener noreferrer">
                        <img src={image.url} alt={`User ${user.name} submission`} className="thumbnail" />
                      </a>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No user submissions found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
