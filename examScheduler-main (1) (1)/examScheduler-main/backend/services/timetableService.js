const { parseCSV } = require('../utils/parser');

/**
 * Main function to process uploaded files and generate the exam timetable.
 * This is a translation of the logic from ExamTimetable.java.
 * @param {Object} studentRegFile The student registration file object from multer.
 * @param {Object} courseDataFile The course data file object from multer.
 * @param {Object} settings The timetable generation settings from the client.
 * @returns {Promise<Array<Object>>} A promise that resolves with the generated timetable data.
 */
const processTimetable = async (studentRegFile, courseDataFile, settings) => {
  // 1. Parse the uploaded CSV files into structured data
  const studentRegistrations = parseCSV(studentRegFile.buffer);
  const courseData = parseCSV(courseDataFile.buffer);

  // 2. Build data structures similar to the Java application
  const studentCoursesMap = new Map(); // Maps student RollNo to a list of their CourseCodes
  const courseInfoMap = new Map();     // Maps CourseCode to its info (title, student count, etc.)

  // Populate courseInfoMap from courseData
  courseData.forEach(course => {
    courseInfoMap.set(course.CourseCode, {
      ...course,
      studentCount: 0,
    });
  });

  // Populate studentCoursesMap and update student counts in courseInfoMap
  studentRegistrations.forEach(reg => {
    if (!studentCoursesMap.has(reg.RollNo)) {
      studentCoursesMap.set(reg.RollNo, []);
    }
    studentCoursesMap.get(reg.RollNo).push(reg.CourseCode);

    if (courseInfoMap.has(reg.CourseCode)) {
      courseInfoMap.get(reg.CourseCode).studentCount++;
    }
  });

  // 3. Prepare for Scheduling: Sort courses by student count (descending)
  const courseList = Array.from(courseInfoMap.values())
    .filter(course => course.studentCount > 0) // Ignore courses with no students
    .sort((a, b) => b.studentCount - a.studentCount);

  const blacklist = new Set(settings.blacklistCourses || []);
  const slots = []; // This will be an array of arrays, where each inner array is a slot

  // 4. Core Scheduling Algorithm (assignCoursesToSlots from Java)
  for (const courseInfo of courseList) {
    if (blacklist.has(courseInfo.CourseCode)) {
      continue; // Skip blacklisted courses
    }

    // Find all courses that have a common student with the current course
    const conflictingCourses = new Set();
    for (const courses of studentCoursesMap.values()) {
      if (courses.includes(courseInfo.CourseCode)) {
        courses.forEach(c => conflictingCourses.add(c));
      }
    }

    let slotIndex = 0;
    let placed = false;

    while (!placed) {
      if (slotIndex >= slots.length) {
        slots.push([]); // Create a new slot if we run out
      }

      const currentSlot = slots[slotIndex];
      let hasConflict = false;

      // Check for direct conflicts within the current slot
      for (const courseInSlot of currentSlot) {
        if (conflictingCourses.has(courseInSlot)) {
          hasConflict = true;
          break;
        }
      }
      
      if(hasConflict) {
        slotIndex++;
        continue;
      }

      // Check resource limits (students per slot, exams per slot)
      const currentStudentCount = currentSlot.reduce((sum, c) => sum + courseInfoMap.get(c).studentCount, 0);
      if (currentStudentCount + courseInfo.studentCount > settings.studentsPerSlot) {
        slotIndex++;
        continue;
      }
      if (currentSlot.length >= settings.examsPerSlot) {
        slotIndex++;
        continue;
      }
      
      // No conflict found, place the course in this slot
      slots[slotIndex].push(courseInfo.CourseCode);
      placed = true;
    }
  }

  // 5. Format the final output
  const finalTimetable = [];
  slots.forEach((slotCourses, index) => {
    const day = Math.floor(index / settings.slotsPerDay) + 1;
    const slotNumber = (index % settings.slotsPerDay) + 1;

    for (const courseCode of slotCourses) {
      const course = courseInfoMap.get(courseCode);
      if (course) {
        finalTimetable.push({
          Day: `Day ${day}`,
          Slot: `Slot ${slotNumber}`,
          CourseCode: course.CourseCode,
          CourseTitle: course.CourseTitle,
          Program: course.Program,
          StudentCount: course.studentCount,
        });
      }
    }
  });

  return finalTimetable;
};

module.exports = { processTimetable };

