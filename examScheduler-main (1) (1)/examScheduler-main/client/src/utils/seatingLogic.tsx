// src/utils/seatingLogic.ts

interface Room {
  locationId: string;
  seatingCapacity: number;
}

interface Staff {
  staffID: string;
  staffName: string;
  staffDept: string;
  totalSlots: number;
  usedInSlot: { [slotKey: string]: boolean };
}

interface StudentCourses {
  [rollNo: string]: string[];
}

const parseRooms = async (file: File): Promise<Room[]> => {
  const text = await file.text();
  const lines = text.split('\n').slice(1); // Skip header
  return lines.map(line => {
    const columns = line.replace(/"/g, '').split(',');
    const [block, roomNo, seatingCapacity] = columns;
    return {
      locationId: `${block}-${roomNo}`,
      seatingCapacity: parseInt(seatingCapacity, 10),
    };
  }).filter(room => room.locationId && !isNaN(room.seatingCapacity) && room.locationId !== 'undefined-undefined');
};

const parseInvigilators = async (file: File): Promise<Staff[]> => {
  const text = await file.text();
  const lines = text.split('\n').slice(1); // Skip header
  return lines.map(line => {
    const [staffID, staffDept, staffName, staffSlots] = line.replace(/"/g, '').split(',');
    return {
      staffID,
      staffName,
      staffDept,
      totalSlots: parseInt(staffSlots, 10),
      usedInSlot: {},
    };
  }).filter(inv => inv.staffID);
};

const parseStudentRegistration = async (file: File): Promise<StudentCourses> => {
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    const studentCourses: StudentCourses = {};
    lines.forEach(line => {
        const [rollNo, courseCode] = line.replace(/"/g, '').split(',');
        if (rollNo && courseCode) {
            if (!studentCourses[rollNo]) {
                studentCourses[rollNo] = [];
            }
            studentCourses[rollNo].push(courseCode.trim());
        }
    });
    return studentCourses;
};


export const processSeating = async (
  roomsFile: File,
  studentRegFile: File,
  timetable: any[]
): Promise<any[]> => {
  const rooms = await parseRooms(roomsFile);
  const studentCourses = await parseStudentRegistration(studentRegFile);
  const seatingArrangement: any[] = [];

  const coursesBySlot = timetable.reduce((acc, exam) => {
    const key = `${exam.Day}-${exam.Slot}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(exam.CourseCode);
    return acc;
  }, {});

  for (const slotKey in coursesBySlot) {
    const coursesInSlot = new Set(coursesBySlot[slotKey]);
    const studentsForSlot: { rollNo: string, course: string }[] = [];

    for (const rollNo in studentCourses) {
        const studentTakesCourseInSlot = studentCourses[rollNo].find(course => coursesInSlot.has(course));
        if (studentTakesCourseInSlot) {
            studentsForSlot.push({ rollNo, course: studentTakesCourseInSlot });
        }
    }

    let studentIndex = 0;
    for (const room of rooms) {
      for (let seat = 1; seat <= room.seatingCapacity; seat++) {
        if (studentIndex < studentsForSlot.length) {
          const student = studentsForSlot[studentIndex];
          const [Day, Slot] = slotKey.split('-');
          seatingArrangement.push({
            Day,
            Slot,
            RoomNo: room.locationId,
            StudentRollNo: student.rollNo,
            SeatNo: seat,
            CourseCode: student.course,
          });
          studentIndex++;
        } else {
          break; 
        }
      }
      if (studentIndex >= studentsForSlot.length) {
        break; 
      }
    }
  }

  return seatingArrangement;
};

export const processInvigilators = async (
  invigilatorsFile: File,
  seatingArrangement: any[]
): Promise<any[]> => {
  const invigilators = await parseInvigilators(invigilatorsFile);
  const invigilatorAssignments: any[] = [];
  
  const assignmentsBySlotAndRoom = seatingArrangement.reduce((acc, seat) => {
    const key = `${seat.Day}-${seat.Slot}-${seat.RoomNo}`;
    if (!acc[key]) {
        acc[key] = { Day: seat.Day, Slot: seat.Slot, RoomNo: seat.RoomNo };
    }
    return acc;
  }, {});

  let invigilatorIndex = 0;
  for (const key in assignmentsBySlotAndRoom) {
      const assignment = assignmentsBySlotAndRoom[key];
      if (invigilators.length > 0) {
        let assigned = false;
        let attempts = 0;
        while (!assigned && attempts < invigilators.length) {
            const invigilator = invigilators[invigilatorIndex % invigilators.length];
            const slotKey = `${assignment.Day}-${assignment.Slot}`;
            
            if (!invigilator.usedInSlot[slotKey] && invigilator.totalSlots > 0) {
                invigilator.usedInSlot[slotKey] = true;
                invigilator.totalSlots--;
                invigilatorAssignments.push({
                    Day: assignment.Day,
                    Slot: assignment.Slot,
                    RoomNo: assignment.RoomNo,
                    InvigilatorName: invigilator.staffName,
                    InvigilatorDept: invigilator.staffDept,
                });
                assigned = true;
            }
            invigilatorIndex++;
            attempts++;
        }
      }
  }

  return invigilatorAssignments;
};
