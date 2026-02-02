const History = require('../models/historyModel');
const { processTimetable } = require('../services/timetableService');
const { processSeating, processInvigilators } = require('../services/seatingService');

/**
 * A helper function to save the generated data to the user's history in MongoDB.
 * @param {string} uid The user's ID.
 * @param {string} type The type of document generated.
 * @param {Array} data The generated data array.
 */
const saveDataToHistory = async (uid, type, data) => {
  try {
    const historyEntry = new History({
      user: uid,
      type,
      data,
    });
    await historyEntry.save();
    console.log(`History saved for user ${uid}, type: ${type}`);
  } catch (error) {
    // This error should be logged but not sent to the user, as the main operation succeeded.
    console.error(`Error saving history for user ${uid}:`, error);
  }
};

// --- Controller Functions ---

/**
 * @desc    Generate an exam timetable
 * @route   POST /api/generate/timetable
 * @access  Private
 */
const generateTimetable = async (req, res) => {
  try {
    // Ensure required files are uploaded
    if (!req.files || !req.files.studentRegistration || !req.files.courseData) {
      return res.status(400).json({ message: 'Missing required files for timetable generation.' });
    }

    const { studentRegistration, courseData } = req.files;
    const settings = JSON.parse(req.body.settings);
    const { _id } = req.user; // Get user ID from auth middleware

    // Process files and generate timetable
    const timetableData = await processTimetable(studentRegistration[0], courseData[0], settings);

    // Save the result to the database asynchronously
    await saveDataToHistory(_id, 'timetable', timetableData);

    // Send the generated data back to the client
    res.status(200).json(timetableData);
  } catch (error) {
    console.error('Error in generateTimetable controller:', error);
    res.status(500).json({ message: 'Failed to generate timetable.' });
  }
};

/**
 * @desc    Generate a seating arrangement
 * @route   POST /api/generate/seating
 * @access  Private
 */
const generateSeating = async (req, res) => {
  try {
    if (!req.files || !req.files.roomData || !req.files.studentRegistration || !req.files.courseData) {
        return res.status(400).json({ message: 'Missing required files for seating generation.' });
    }

    const { roomData, studentRegistration, courseData } = req.files;
    const { _id } = req.user;

    // First, generate the timetable to know which exams are in which slot
    const timetableSettings = JSON.parse(req.body.settings || '{}'); // Assuming settings might be needed
    const timetableData = await processTimetable(studentRegistration[0], courseData[0], timetableSettings);

    // Now, generate the seating plan based on the timetable
    const seatingData = await processSeating(roomData[0], studentRegistration[0], timetableData);

    await saveDataToHistory(_id, 'seating', seatingData);

    res.status(200).json(seatingData);
  } catch (error) {
      console.error('Error in generateSeating controller:', error);
      res.status(500).json({ message: 'Failed to generate seating arrangement.' });
  }
};

/**
 * @desc    Generate invigilator assignments
 * @route   POST /api/generate/invigilators
 * @access  Private
 */
const generateInvigilators = async (req, res) => {
    try {
        if (!req.files || !req.files.invigilatorData || !req.files.roomData || !req.files.studentRegistration || !req.files.courseData) {
            return res.status(400).json({ message: 'Missing required files for invigilator assignment.' });
        }

        const { invigilatorData, roomData, studentRegistration, courseData } = req.files;
        const { _id } = req.user;

        // We need to generate the timetable and seating plan first
        const timetableSettings = JSON.parse(req.body.settings || '{}');
        const timetableData = await processTimetable(studentRegistration[0], courseData[0], timetableSettings);
        const seatingData = await processSeating(roomData[0], studentRegistration[0], timetableData);

        // Now, generate invigilator assignments
        const invigilatorAssignments = await processInvigilators(invigilatorData[0], seatingData);

        await saveDataToHistory(_id, 'invigilators', invigilatorAssignments);

        res.status(200).json(invigilatorAssignments);
    } catch (error) {
        console.error('Error in generateInvigilators controller:', error);
        res.status(500).json({ message: 'Failed to generate invigilator assignments.' });
    }
};


module.exports = { 
  generateTimetable,
  generateSeating,
  generateInvigilators
};