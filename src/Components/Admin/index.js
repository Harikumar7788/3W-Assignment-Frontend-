import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const Admin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null); 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://threewassignment-backend.onrender.com/api/register-admin', {
        username: formData.username,
        password: formData.password,
      });


      const token = response.data.token;
      localStorage.setItem('token', token); 

      setIsAuthenticated(true);
      setError('');
      fetchUsers(); 
    } catch (error) {
      setError('Invalid username or password');
      setIsAuthenticated(false);
    }
  };

 
  const handleLogout = () => {
    setIsAuthenticated(false);  
    setFormData({ username: '', password: '' }); 
    setUsers([]);  
    if (socket) socket.close();
  };


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

  useEffect(() => {
    if (isAuthenticated) {
      const ws = new WebSocket('wss://threewassignment-backend.onrender.com'); 
      setSocket(ws);

      ws.onmessage = (event) => {
        const newUser = JSON.parse(event.data);
        setUsers((prevUsers) => [...prevUsers, newUser]); 
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        if (ws) ws.close(); 
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
          <h2>Assume you are an Admin and Enter Your username and your Password  </h2>
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
