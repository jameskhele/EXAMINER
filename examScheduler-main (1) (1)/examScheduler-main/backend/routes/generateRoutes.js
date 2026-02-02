const express = require('express');
const multer = require('multer');
const { generateTimetable, generateSeating, generateInvigilators } = require('../controllers/generateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Define Routes ---

// @route   POST /api/generate/timetable
// @desc    Generate an exam timetable
// @access  Private
router.post(
  '/timetable',
  protect,
  // Correctly define the expected fields for timetable generation
  upload.fields([
    { name: 'studentRegistration', maxCount: 1 },
    { name: 'courseData', maxCount: 1 },
  ]),
  generateTimetable
);

// @route   POST /api/generate/seating
// @desc    Generate a seating arrangement
// @access  Private
router.post(
  '/seating',
  protect,
  // Correctly define the expected fields for seating generation
  upload.fields([
    { name: 'roomData', maxCount: 1 },
    { name: 'studentRegistration', maxCount: 1 },
    { name: 'courseData', maxCount: 1 }, // Also needed to get student names
  ]),
  generateSeating
);

// @route   POST /api/generate/invigilators
// @desc    Generate invigilator assignments
// @access  Private
router.post(
  '/invigilators',
  protect,
  // Correctly define the expected fields for invigilator assignment
  upload.fields([
    { name: 'invigilatorData', maxCount: 1 },
    { name: 'roomData', maxCount: 1 },
    { name: 'studentRegistration', maxCount: 1 },
    { name: 'courseData', maxCount: 1 },
    { name: 'timetableData', maxCount: 1 },
  ]),
  generateInvigilators
);

module.exports = router;

