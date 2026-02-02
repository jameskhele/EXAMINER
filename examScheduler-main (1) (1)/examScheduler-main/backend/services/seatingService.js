const { parseCSV } = require('../utils/parser');

/**
 * Groups students by the courses they are taking.
 * @param {Array<Object>} studentRegistrations Parsed student registration data.
 * @returns {Map<string, Array<string>>} A map where keys are CourseCodes and values are arrays of student RollNos.
 */
const groupStudentsByCourse = (studentRegistrations) => {
    const courseStudentMap = new Map();
    studentRegistrations.forEach(reg => {
        if (!courseStudentMap.has(reg.CourseCode)) {
            courseStudentMap.set(reg.CourseCode, []);
        }
        courseStudentMap.get(reg.CourseCode).push(reg.RollNo);
    });
    return courseStudentMap;
};

/**
 * Processes uploaded files to generate a seating arrangement for all exam slots.
 * @param {Object} roomFile The room data file from multer.
 * @param {Object} studentRegFile The student registration file from multer.
 * @param {Array<Object>} timetable The generated timetable data.
 * @returns {Promise<Array<Object>>} A promise that resolves with the generated seating arrangement.
 */
const processSeating = async (roomFile, studentRegFile, timetable) => {
    const rooms = parseCSV(roomFile.buffer);
    const studentRegistrations = parseCSV(studentRegFile.buffer);
    const courseStudentMap = groupStudentsByCourse(studentRegistrations);

    const fullSeatingPlan = [];

    // Group courses by Day and Slot from the timetable
    const slots = new Map();
    timetable.forEach(exam => {
        const key = `${exam.Day}-${exam.Slot}`;
        if (!slots.has(key)) {
            slots.set(key, []);
        }
        slots.get(key).push(exam.CourseCode);
    });

    // Generate seating for each slot
    for (const [slotKey, coursesInSlot] of slots.entries()) {
        const [day, slot] = slotKey.split('-');
        let studentQueue = [];

        // Create a queue of all students taking an exam in this slot
        coursesInSlot.forEach(courseCode => {
            const students = courseStudentMap.get(courseCode) || [];
            students.forEach(rollNo => {
                studentQueue.push({ rollNo, courseCode });
            });
        });

        // Distribute students across available rooms
        let studentIndex = 0;
        for (const room of rooms) {
            if (studentIndex >= studentQueue.length) break;

            const roomCapacity = parseInt(room.SeatingCapacity, 10);
            for (let seat = 1; seat <= roomCapacity; seat++) {
                if (studentIndex >= studentQueue.length) break;

                const student = studentQueue[studentIndex];
                fullSeatingPlan.push({
                    Day: day,
                    Slot: slot,
                    RoomNo: room.RoomNo,
                    StudentRollNo: student.rollNo,
                    SeatNo: seat,
                    CourseCode: student.courseCode,
                });
                studentIndex++;
            }
        }
    }

    return fullSeatingPlan;
};

/**
 * Processes files to generate invigilator assignments.
 * @param {Object} invigilatorFile The invigilator data file from multer.
 * @param {Array<Object>} seatingPlan The generated seating arrangement.
 * @returns {Promise<Array<Object>>} A promise that resolves with the invigilator assignments.
 */
const processInvigilators = async (invigilatorFile, seatingPlan) => {
    const invigilators = parseCSV(invigilatorFile.buffer);
    const assignments = [];

    // Group rooms by slot
    const roomsBySlot = new Map();
    seatingPlan.forEach(seat => {
        const key = `${seat.Day}-${seat.Slot}`;
        if (!roomsBySlot.has(key)) {
            roomsBySlot.set(key, new Set());
        }
        roomsBySlot.get(key).add(seat.RoomNo);
    });

    let invigilatorIndex = 0;
    for (const [slotKey, rooms] of roomsBySlot.entries()) {
        const [day, slot] = slotKey.split('-');
        for (const roomNo of rooms) {
            // Simple round-robin assignment for demonstration
            const invigilator = invigilators[invigilatorIndex % invigilators.length];
            assignments.push({
                Day: day,
                Slot: slot,
                RoomNo: roomNo,
                InvigilatorID: invigilator.StaffID,
                InvigilatorName: invigilator.StaffName,
                InvigilatorDept: invigilator.StaffDept,
            });
            invigilatorIndex++;
        }
    }

    return assignments;
};


module.exports = { processSeating, processInvigilators };