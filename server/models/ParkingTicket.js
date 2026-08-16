// ==============================================================================
// FILE: models/ParkingTicket.js
// PURPOSE: Defines the Schema (blueprint) for Parking Ticket records in MongoDB.
// ==============================================================================

const mongoose = require('mongoose');

// Define what information each parking ticket will store
const parkingTicketSchema = new mongoose.Schema({
  // Unique service number generated when a vehicle is booked
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // Vehicle registration plate number (e.g. MH-12-AB-1234)
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    uppercase: true,
    trim: true,
  },
  // Name of vehicle owner or driver
  ownerName: {
    type: String,
    default: 'Guest',
    trim: true,
  },
  // Type of vehicle
  vehicleType: {
    type: String,
    enum: ['Car', 'Bike', 'SUV', 'Truck'],
    default: 'Car',
  },
  // Assigned Parking Slot
  slotNumber: {
    type: String,
    required: true,
  },
  // Status: PARKED (currently inside) or EXITED (left the parking)
  status: {
    type: String,
    enum: ['PARKED', 'EXITED'],
    default: 'PARKED',
  },
  // Time when vehicle entered
  entryTime: {
    type: Date,
    default: Date.now,
  },
  // Time when vehicle exited (optional, set upon release)
  exitTime: {
    type: Date,
  },
});

// Export the Model so we can use it in our routes to create, read, and update tickets
module.exports = mongoose.model('ParkingTicket', parkingTicketSchema);
