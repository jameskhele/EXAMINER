// src/utils/timetableLogic.ts

interface CourseInfo {
  courseCode: string;
  courseTitle: string;
  school: string;
  program: string;
  studentCount: number;
}

interface StudentCourses {
  rollNo: string;
  courses: string[];
}

interface TimetableSettings {
  slotsPerDay: number;
  examsPerSlot: number;
  studentsPerSlot: number;
  blacklistCourses: string[];
}

const parseStudentRegistration = async (file: File): Promise<Map<string, string[]>> => {
  const text = await file.text();
  const lines = text.split('\n').slice(1); // Skip header
  const studentCoursesMap = new Map<string, string[]>();

  lines.forEach(line => {
    const [rollNo, courseCode] = line.replace(/"/g, '').split(',');
    if (rollNo && courseCode) {
      if (!studentCoursesMap.has(rollNo)) {
        studentCoursesMap.set(rollNo, []);
      }
      studentCoursesMap.get(rollNo)?.push(courseCode);
    }
  });

  return studentCoursesMap;
};

const parseCourseData = async (file: File): Promise<Map<string, CourseInfo>> => {
  const text = await file.text();
  const lines = text.split('\n').slice(1); // Skip header
  const courseInfoMap = new Map<string, CourseInfo>();

  lines.forEach(line => {
    const [courseCode, courseTitle, school, program] = line.replace(/"/g, '').split(',');
    if (courseCode) {
      courseInfoMap.set(courseCode, {
        courseCode,
        courseTitle,
        school,
        program,
        studentCount: 0,
      });
    }
  });

  return courseInfoMap;
};

export const processTimetable = async (
  studentRegFile: File,
  courseDataFile: File,
  settings: TimetableSettings
): Promise<any[]> => {
  const studentCoursesMap = await parseStudentRegistration(studentRegFile);
  const courseInfoMap = await parseCourseData(courseDataFile);

  // Calculate student count for each course
  studentCoursesMap.forEach(courses => {
    courses.forEach(courseCode => {
      if (courseInfoMap.has(courseCode)) {
        const course = courseInfoMap.get(courseCode)!;
        course.studentCount++;
      }
    });
  });

  const courseInfoList = Array.from(courseInfoMap.values()).sort((a, b) => b.studentCount - a.studentCount);

  const slots: string[][] = [[]];
  let clashedCourses = 0;

  courseInfoList.forEach(courseInfo => {
    let slotIndex = 0;
    const initialCourse = courseInfo.courseCode;

    if (settings.blacklistCourses.includes(initialCourse)) {
      return;
    }

    const conflictingCourses = new Set<string>();
    studentCoursesMap.forEach(studentCourses => {
      if (studentCourses.includes(initialCourse)) {
        studentCourses.forEach(course => conflictingCourses.add(course));
      }
    });

    let conflict = true;
    while (conflict) {
      conflict = false;
      const currentSlotCourses = new Set(slots[slotIndex]);
      let totalStudentCount = 0;

      currentSlotCourses.forEach(courseCode => {
        totalStudentCount += courseInfoMap.get(courseCode)?.studentCount || 0;
      });
      totalStudentCount += courseInfo.studentCount;

      if (totalStudentCount > settings.studentsPerSlot) {
        slotIndex++;
        if (slotIndex >= slots.length) slots.push([]);
        conflict = true;
        continue;
      }

      for (const conflictingCourse of conflictingCourses) {
        if (currentSlotCourses.has(conflictingCourse)) {
          slotIndex++;
          if (slotIndex >= slots.length) slots.push([]);
          conflict = true;
          break;
        }
      }

      if (!conflict) {
        if (slots[slotIndex].length >= settings.examsPerSlot) {
          slotIndex++;
          if (slotIndex >= slots.length) slots.push([]);
          conflict = true;
        }
      }
    }
    slots[slotIndex].push(initialCourse);
  });

  // Format the output
  const timetable: any[] = [];
  slots.forEach((slot, index) => {
    const day = Math.floor(index / settings.slotsPerDay) + 1;
    const slotInDay = (index % settings.slotsPerDay) + 1;
    slot.forEach(courseCode => {
      const courseInfo = courseInfoMap.get(courseCode);
      if (courseInfo) {
        timetable.push({
          Day: `Day ${day}`,
          Slot: `Slot ${slotInDay}`,
          CourseCode: courseCode,
          CourseTitle: courseInfo.courseTitle,
          Program: courseInfo.program,
          School: courseInfo.school,
        });
      }
    });
  });

  return timetable;
};
