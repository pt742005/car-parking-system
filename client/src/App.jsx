// ==============================================================================
// FILE: src/App.jsx
// PURPOSE: Main React Component for "Car Parking Service Number System"
// ==============================================================================

import { useState, useEffect } from 'react';
import './App.css';

// The Backend API base URL (Express Server)
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // State 1: Active Tab / View ('home', 'book', 'check', 'admin')
  const [activeTab, setActiveTab] = useState('home');

  // State 2: Backend server & Database connection status
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [dbStatus, setDbStatus] = useState('');

  // State 3: Booking Form Inputs
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // State 4: Check Parking Search
  const [searchQuery, setSearchQuery] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState('');
  const [isCheckLoading, setIsCheckLoading] = useState(false);

  // State 5: Admin View Data
  const [adminData, setAdminData] = useState({ tickets: [], totalCount: 0, currentlyParked: 0, totalExited: 0 });
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // EFFECT: Check Backend Health on Initial Page Load
  // ----------------------------------------------------------------------------
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('online');
        setDbStatus(data.database || 'connected');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('offline');
    }
  };

  // ----------------------------------------------------------------------------
  // HANDLER: Book a Parking Slot (Calls POST /api/parking/book)
  // ----------------------------------------------------------------------------
  const handleBookParking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingResult(null);

    if (!vehicleNumber.trim()) {
      setBookingError('Please enter a vehicle registration number.');
      return;
    }

    setIsBookingLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/parking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.trim(),
          ownerName: ownerName.trim() || 'Guest',
          vehicleType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingResult(data.ticket);
        setVehicleNumber('');
        setOwnerName('');
      } else {
        setBookingError(data.message || 'Failed to book parking slot.');
      }
    } catch (error) {
      setBookingError('Could not connect to backend server. Make sure server is running on port 5000.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // HANDLER: Check Parking Ticket (Calls GET /api/parking/check/:query)
  // ----------------------------------------------------------------------------
  const handleCheckParking = async (e) => {
    e.preventDefault();
    setCheckError('');
    setCheckResult(null);

    if (!searchQuery.trim()) {
      setCheckError('Please enter a Service Number (e.g. PARK-1001) or Vehicle Number.');
      return;
    }

    setIsCheckLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/parking/check/${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();

      if (data.success) {
        setCheckResult(data.ticket);
      } else {
        setCheckError(data.message || 'No record found.');
      }
    } catch (error) {
      setCheckError('Could not connect to backend server. Make sure server is running.');
    } finally {
      setIsCheckLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // HANDLER: Load Admin Parking List (Calls GET /api/parking/all)
  // ----------------------------------------------------------------------------
  const loadAdminData = async () => {
    setIsAdminLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/parking/all`);
      const data = await response.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsAdminLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // HANDLER: Release Parking / Mark Exit (Calls PUT /api/parking/exit/:ticketNumber)
  // ----------------------------------------------------------------------------
  const handleExitVehicle = async (ticketNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parking/exit/${ticketNumber}`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        // Refresh admin data or active check view
        if (activeTab === 'admin') loadAdminData();
        if (checkResult && checkResult.ticketNumber === ticketNumber) {
          setCheckResult(data.ticket);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error updating vehicle status.');
    }
  };

  // Switch tab and load data if needed
  const switchTab = (tab) => {
    setActiveTab(tab);
    setBookingError('');
    setBookingResult(null);
    setCheckError('');
    setCheckResult(null);
    if (tab === 'admin') {
      loadAdminData();
    }
  };

  return (
    <div className="container">
      {/* 1. Header Section */}
      <header className="header">
        <div className="logo-badge">🅿️ Smart Parking</div>
        <h1 className="title">Car Parking Service Number System</h1>
        <p className="subtitle">Simple MERN Stack Parking Management & Service Token Generator</p>

        {/* Backend Status Indicator */}
        <div className="status-bar">
          <span className="status-label">Backend API:</span>
          {backendStatus === 'checking' && <span className="badge badge-checking">⏳ Connecting...</span>}
          {backendStatus === 'online' && (
            <span className="badge badge-online">
              🟢 Server Online (Port 5000) {dbStatus && `| DB: ${dbStatus}`}
            </span>
          )}
          {backendStatus === 'offline' && (
            <span className="badge badge-offline" onClick={checkBackendHealth} style={{ cursor: 'pointer' }}>
              🔴 Server Offline (Click to retry)
            </span>
          )}
        </div>
      </header>

      {/* 2. Navigation Action Buttons */}
      <nav className="nav-buttons">
        <button
          id="btn-home"
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => switchTab('home')}
        >
          🏠 Home
        </button>
        <button
          id="btn-book"
          className={`nav-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => switchTab('book')}
        >
          🚗 Book Parking
        </button>
        <button
          id="btn-check"
          className={`nav-btn ${activeTab === 'check' ? 'active' : ''}`}
          onClick={() => switchTab('check')}
        >
          🔍 Check Parking
        </button>
        <button
          id="btn-admin"
          className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => switchTab('admin')}
        >
          ⚙️ Admin
        </button>
      </nav>

      {/* 3. Main Dynamic Content */}
      <main className="content-card">
        {/* VIEW 1: HOME OVERVIEW */}
        {activeTab === 'home' && (
          <div className="view-home">
            <h2>Welcome to Car Parking Service System</h2>
            <p className="description">
              This is a beginner-friendly MERN stack application demonstrating how React communicates with an Express and MongoDB backend.
            </p>

            <div className="features-grid">
              <div className="feature-card" onClick={() => switchTab('book')}>
                <div className="feature-icon">🚗</div>
                <h3>Book Parking</h3>
                <p>Register a vehicle and generate an instant service token number with an allocated parking slot.</p>
                <button className="btn-link">Book Spot &rarr;</button>
              </div>

              <div className="feature-card" onClick={() => switchTab('check')}>
                <div className="feature-icon">🔍</div>
                <h3>Check Parking</h3>
                <p>Search using your Service Number or Vehicle Plate to view allocated slot, time, and parking status.</p>
                <button className="btn-link">Search Status &rarr;</button>
              </div>

              <div className="feature-card" onClick={() => switchTab('admin')}>
                <div className="feature-icon">⚙️</div>
                <h3>Admin View</h3>
                <p>Monitor all parked vehicles in real-time, view total capacity, and manage vehicle checkout.</p>
                <button className="btn-link">Open Admin &rarr;</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: BOOK PARKING */}
        {activeTab === 'book' && (
          <div className="view-book">
            <h2>🚗 Book a Parking Spot</h2>
            <p className="description">Enter vehicle details to generate a unique parking service number.</p>

            {bookingError && <div className="alert alert-danger">{bookingError}</div>}

            <form onSubmit={handleBookParking} className="form-group">
              <div className="form-field">
                <label htmlFor="vehicleNumber">Vehicle Registration Number *</label>
                <input
                  id="vehicleNumber"
                  type="text"
                  placeholder="e.g. DL-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="ownerName">Owner / Driver Name</label>
                <input
                  id="ownerName"
                  type="text"
                  placeholder="e.g. John Doe (Optional)"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike / Two Wheeler</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck / Commercial</option>
                </select>
              </div>

              <button type="submit" className="btn-submit" disabled={isBookingLoading}>
                {isBookingLoading ? 'Booking Slot...' : '🎫 Generate Service Number & Book'}
              </button>
            </form>

            {/* Generated Parking Pass / Ticket */}
            {bookingResult && (
              <div className="ticket-card">
                <div className="ticket-header">
                  <h3>✅ Parking Booked Successfully!</h3>
                  <span className="ticket-badge">{bookingResult.status}</span>
                </div>
                <div className="ticket-body">
                  <div className="ticket-item highlight">
                    <span className="label">SERVICE NUMBER:</span>
                    <span className="value-token">{bookingResult.ticketNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Vehicle Number:</span>
                    <span className="value">{bookingResult.vehicleNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Assigned Slot:</span>
                    <span className="value slot-box">{bookingResult.slotNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Owner Name:</span>
                    <span className="value">{bookingResult.ownerName}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Entry Time:</span>
                    <span className="value">{new Date(bookingResult.entryTime).toLocaleString()}</span>
                  </div>
                </div>
                <p className="ticket-footer">
                  💡 Please keep your <strong>Service Number ({bookingResult.ticketNumber})</strong> to retrieve your vehicle later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: CHECK PARKING */}
        {activeTab === 'check' && (
          <div className="view-check">
            <h2>🔍 Check Parking Status</h2>
            <p className="description">Search using your Service Number (e.g. PARK-1234) or Vehicle Number.</p>

            {checkError && <div className="alert alert-danger">{checkError}</div>}

            <form onSubmit={handleCheckParking} className="search-box">
              <input
                id="searchQuery"
                type="text"
                placeholder="Enter Service Number or Vehicle Plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-submit" disabled={isCheckLoading}>
                {isCheckLoading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {checkResult && (
              <div className="ticket-card">
                <div className="ticket-header">
                  <h3>Parking Details</h3>
                  <span
                    className={`ticket-badge ${
                      checkResult.status === 'PARKED' ? 'badge-online' : 'badge-offline'
                    }`}
                  >
                    {checkResult.status}
                  </span>
                </div>
                <div className="ticket-body">
                  <div className="ticket-item highlight">
                    <span className="label">SERVICE NUMBER:</span>
                    <span className="value-token">{checkResult.ticketNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Vehicle Number:</span>
                    <span className="value">{checkResult.vehicleNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Allocated Slot:</span>
                    <span className="value slot-box">{checkResult.slotNumber}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Vehicle Type:</span>
                    <span className="value">{checkResult.vehicleType}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Owner:</span>
                    <span className="value">{checkResult.ownerName}</span>
                  </div>
                  <div className="ticket-item">
                    <span className="label">Entry Time:</span>
                    <span className="value">{new Date(checkResult.entryTime).toLocaleString()}</span>
                  </div>
                  {checkResult.exitTime && (
                    <div className="ticket-item">
                      <span className="label">Exit Time:</span>
                      <span className="value">{new Date(checkResult.exitTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {checkResult.status === 'PARKED' && (
                  <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                    <button
                      className="btn-danger"
                      onClick={() => handleExitVehicle(checkResult.ticketNumber)}
                    >
                      🚪 Vehicle Exit / Release Slot
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="view-admin">
            <div className="admin-header">
              <h2>⚙️ Parking Admin Management</h2>
              <button className="btn-refresh" onClick={loadAdminData} disabled={isAdminLoading}>
                🔄 {isAdminLoading ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="metric-num">{adminData.currentlyParked}</span>
                <span className="metric-title">Currently Parked</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{adminData.totalExited}</span>
                <span className="metric-title">Completed Exits</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{adminData.totalCount}</span>
                <span className="metric-title">Total Bookings</span>
              </div>
            </div>

            {/* Table of Records */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service #</th>
                    <th>Vehicle Plate</th>
                    <th>Type</th>
                    <th>Slot</th>
                    <th>Status</th>
                    <th>Entry Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.tickets && adminData.tickets.length > 0 ? (
                    adminData.tickets.map((t) => (
                      <tr key={t._id || t.ticketNumber}>
                        <td><strong>{t.ticketNumber}</strong></td>
                        <td>{t.vehicleNumber}</td>
                        <td>{t.vehicleType}</td>
                        <td><span className="slot-pill">{t.slotNumber}</span></td>
                        <td>
                          <span className={`status-pill ${t.status === 'PARKED' ? 'parked' : 'exited'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>{new Date(t.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          {t.status === 'PARKED' ? (
                            <button
                              className="btn-table-action"
                              onClick={() => handleExitVehicle(t.ticketNumber)}
                            >
                              Exit
                            </button>
                          ) : (
                            <span className="text-muted">Cleared</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No parking records yet. Book a parking spot to see it here!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="footer">
        <p>Built with React.js, Vite, Node.js, Express, MongoDB & Mongoose</p>
      </footer>
    </div>
  );
}

export default App;
