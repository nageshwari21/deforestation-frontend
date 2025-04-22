import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MapView from './components/MapView';

// Mock API URL - replace with your actual backend URL when deployed
// const API_URL = 'http://localhost:5000';
const API_URL = 'http://192.168.1.3:5000';


function App() {
  const [predictionInput, setPredictionInput] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    year: 2025,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    // Fetch sample data for display
    axios.get(`${API_URL}/sample-data`)
      .then(response => {
        console.log('Sample data:', response.data); // Ensure it's an array
        setSampleData(response.data); // Set the sample data (should be an array)
      })
      .catch(err => {
        console.error('Error fetching sample data:', err);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPredictionInput({
      ...predictionInput,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        latitude: parseFloat(predictionInput.latitude),
        longitude: parseFloat(predictionInput.longitude),
        year: parseInt(predictionInput.year),
      });

      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while making the prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'green';
      case 'medium': return 'orange';
      case 'low': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Deforestation Prediction System</h1>
        <p>Predict forest loss based on location and historical trends</p>
      </header>

      <main className="app-main">
        <section className="prediction-form-container">
          <h2>Make a Prediction</h2>
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-group">
              <label htmlFor="latitude">Latitude:</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={predictionInput.latitude}
                onChange={handleInputChange}
                min="-90"
                max="90"
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude:</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={predictionInput.longitude}
                onChange={handleInputChange}
                min="-180"
                max="180"
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Target Year:</label>
              <input
                type="number"
                id="year"
                name="year"
                value={predictionInput.year}
                onChange={handleInputChange}
                min="2024"
                max="2100"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Deforestation'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {prediction && (
            <div className="prediction-result">
              <h3>Prediction Results</h3>
              <p>
                <strong>Location:</strong> {prediction.latitude}° N, {prediction.longitude}° E
              </p>
              <p>
                <strong>Target Year:</strong> {prediction.year}
              </p>
              <p>
                <strong>Predicted Deforestation:</strong>{' '}
                <span className="prediction-value">
                  {prediction.predicted_deforestation_percent.toFixed(2)}%
                </span>
              </p>
              <p>
                <strong>Confidence Level:</strong>{' '}
                <span style={{ color: getConfidenceColor(prediction.confidence) }}>
                  {prediction.confidence.toUpperCase()}
                </span>
              </p>
              <div className="interpretation">
                <h4>Interpretation</h4>
                <p>
                  {prediction.predicted_deforestation_percent > 10
                    ? 'This area is at high risk of significant deforestation. Early intervention is recommended.'
                    : prediction.predicted_deforestation_percent > 5
                    ? 'This area shows moderate risk of deforestation. Monitoring is advised.'
                    : 'This area shows relatively low risk of deforestation based on historical trends.'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Map Section - Positioned to the right side of the form */}
        <section className="map-container">
          {prediction && (
            <MapView
              latitude={parseFloat(prediction.latitude)}
              longitude={parseFloat(prediction.longitude)}
            />
          )}
        </section>

      </main>

      <section className="data-visualization">
        <h2>Historical Deforestation Data</h2>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Year</th>
                <th>Deforestation Percent</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sampleData) && sampleData.length > 0 ? (
                sampleData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.latitude}</td>
                    <td>{item.longitude}</td>
                    <td>{item.year}</td>
                    <td>{item.deforestation_percent}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No sample data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
