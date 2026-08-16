// ==============================================================================
// FILE: routes/parkingRoutes.js
// PURPOSE: Handles API endpoints for booking, checking, and managing parking.
// ==============================================================================

const express = require('express');
const router = express.Router();
const ParkingTicket = require('../models/ParkingTicket');

// Helper function to generate a simple unique service number like 'PARK-7429'
const generateServiceNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PARK-${randomDigits}`;
};

// Helper function to pick a slot (simple simulation for beginner project)
const generateSlotNumber = () => {
  const letters = ['A', 'B', 'C', 'D'];
  const row = letters[Math.floor(Math.random() * letters.length)];
  const slotNum = Math.floor(1 + Math.random() * 20);
  return `${row}-${slotNum}`;
};

// ------------------------------------------------------------------------------
// ROUTE 1: BOOK A PARKING SPOT
// Method: POST /api/parking/book
// Body: { vehicleNumber, ownerName, vehicleType }
// ------------------------------------------------------------------------------
router.post('/book', async (req, res) => {
  try {
    const { vehicleNumber, ownerName, vehicleType } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required.',
      });
    }

    // Check if the vehicle is already parked inside
    const existingVehicle = await ParkingTicket.findOne({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      status: 'PARKED',
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicleNumber.toUpperCase()} is already parked with Ticket: ${existingVehicle.ticketNumber}`,
        ticket: existingVehicle,
      });
    }

    // Create a new parking record
    const newTicket = new ParkingTicket({
      ticketNumber: generateServiceNumber(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      ownerName: ownerName || 'Guest',
      vehicleType: vehicleType || 'Car',
      slotNumber: generateSlotNumber(),
      status: 'PARKED',
      entryTime: new Date(),
    });

    // Save into MongoDB
    const savedTicket = await newTicket.save();

    res.status(201).json({
      success: true,
      message: 'Parking booked successfully!',
      ticket: savedTicket,
    });
  } catch (error) {
    console.error('Error booking parking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking parking spot.',
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------------------
// ROUTE 2: CHECK PARKING BY SERVICE NUMBER OR VEHICLE NUMBER
// Method: GET /api/parking/check/:query
// ------------------------------------------------------------------------------
router.get('/check/:query', async (req, res) => {
  try {
    const query = req.params.query.trim().toUpperCase();

    // Search by either ticketNumber or vehicleNumber
    const ticket = await ParkingTicket.findOne({
      $or: [{ ticketNumber: query }, { vehicleNumber: query }],
    }).sort({ entryTime: -1 }); // Get the latest record

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `No parking record found for '${query}'. Please verify your Service Number or Vehicle Number.`,
      });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error checking parking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking parking status.',
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------------------
// ROUTE 3: GET ALL PARKING RECORDS (FOR ADMIN VIEW)
// Method: GET /api/parking/all
// ------------------------------------------------------------------------------
router.get('/all', async (req, res) => {
  try {
    const tickets = await ParkingTicket.find().sort({ entryTime: -1 });

    const totalParked = tickets.filter((t) => t.status === 'PARKED').length;
    const totalExited = tickets.filter((t) => t.status === 'EXITED').length;

    res.json({
      success: true,
      totalCount: tickets.length,
      currentlyParked: totalParked,
      totalExited: totalExited,
      tickets,
    });
  } catch (error) {
    console.error('Error fetching parking records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching parking list.',
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------------------
// ROUTE 4: RELEASE / EXIT PARKING
// Method: PUT /api/parking/exit/:ticketNumber
// ------------------------------------------------------------------------------
router.put('/exit/:ticketNumber', async (req, res) => {
  try {
    const ticketNumber = req.params.ticketNumber.trim().toUpperCase();

    const ticket = await ParkingTicket.findOne({ ticketNumber });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Parking ticket not found.',
      });
    }

    if (ticket.status === 'EXITED') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle has already exited the parking.',
        ticket,
      });
    }

    ticket.status = 'EXITED';
    ticket.exitTime = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: `Vehicle ${ticket.vehicleNumber} successfully exited. Slot ${ticket.slotNumber} is now free.`,
      ticket,
    });
  } catch (error) {
    console.error('Error releasing parking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating parking exit status.',
      error: error.message,
    });
  }
});

module.exports = router;
