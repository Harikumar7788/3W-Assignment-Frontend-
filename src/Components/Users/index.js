import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const UserSubmissionForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    socialMediaHandle: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prevImages) => [...prevImages, ...files]);

   
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...filePreviews]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('socialMediaHandle', formData.socialMediaHandle);
    selectedImages.forEach((image) => {
      formDataToSend.append('images', image);
    });

    try {
    
      const response = await axios.post('https://threewassignment-backend.onrender.com/api/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.images) {

        setFormData({ name: '', socialMediaHandle: '' });
        setSelectedImages([]);
        setImagePreviews(response.data.images.map((image) => image.url));
        setMessage('Form submitted successfully!');
      } else {
        setMessage('Failed to upload images.');
      }
    } catch (error) {
      setMessage('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>User Submission Form</h2>

      <Link to = "/admin"> <button className="submit-btn1"> Admin View </button> </Link>
      <form onSubmit={handleSubmit} className="submission-form">
 
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="socialMediaHandle">Social Media Handle:</label>
          <input
            type="text"
            id="socialMediaHandle"
            name="socialMediaHandle"
            value={formData.socialMediaHandle}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Upload Images:</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>


   
        <div className="selected-images-list">
          <h3>Selected Images:</h3>
          <ul>
            {selectedImages.map((image, index) => (
              <li key={index}>
                <img src={URL.createObjectURL(image)} alt={`Image ${index}`} />
              </li>
            ))}
          </ul>
        </div>


        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {message && <p className="submission-message">{message}</p>}
      </form>
    </div>
  );
};

export default UserSubmissionForm;
