# Firestore Data Structure for RVU Connect

## Collections and Documents

### 1. users/{userId}
Document fields (all strings except where noted):
- name: "Esheshwari Kumari"
- usn: "1RV21CS045"
- branch: "Computer Science & Engineering"
- semester: "6th Semester"
- year: "3rd Year"
- section: "A"
- phone: "+91 98765 43210"
- email: "esheshwarikumarbca@rvu.edu.in"
- avatar: "AR"
- dob: "12 March 2003"
- hostel: "Day Scholar"
- attendance: "84%" (string)
- cgpa: "9.4" (string)
- credits: "142" (string)
- backlogs: "0" (string)

### 2. users/{userId}/attendance/{subjectId}
Subcollection documents:
- subject: "Data Structures"
- attended: 38 (number)
- total: 45 (number)
- color: "#1A3C6E"

### 3. timetables/{day}
Documents for each day (Mon, Tue, Wed, Thu, Fri, Sat):
- classes: array of objects with:
  - id: "1"
  - subject: "Data Structures"
  - time: "9:00 AM"
  - room: "CS-101"
  - faculty: "Dr. Meera Iyer"
  - buildingId: "2" (optional)

### 4. events/{eventId}
- id: "1"
- title: "Hackathon 2025"
- category: "Technical"
- date: "Apr 10–11, 2025"
- time: "9:00 AM"
- venue: "Main Auditorium"
- organizer: "CSE Dept"
- description: "Annual 24-hour hackathon..."
- color: "#1A3C6E"
- registered: true/false
- seats: "200 seats"
- startDate: "2025-04-10" (optional)
- registrationCloses: "2025-04-05" (optional)
- venueBuildingId: "1" (optional)

### 5. announcements/{announcementId}
- id: "1"
- title: "Mid-Semester Exam Schedule Released"
- body: "The timetable for mid-semester exams has been published..."
- time: "2 hours ago"
- type: "exam"
- unread: true/false

### 6. clubs/{clubId}
- id: "1"
- name: "IEEE Student Branch"
- members: 120 (number)
- category: "Technical"
- emoji: "⚡"
- color: "#1A3C6E"

## Data Types in Firestore Console

When adding data manually in Firebase Console:

- **Strings**: usn, name, branch, email, dob, etc.
- **Numbers**: attended, total, members, etc.
- **Booleans**: registered, unread
- **Arrays**: classes (array of maps/objects)
- **Maps**: Use for complex objects like class items

## Sample Data Entry

For timetables/Mon document:
```json
{
  "classes": [
    {
      "id": "1",
      "subject": "Data Structures",
      "time": "9:00 AM",
      "room": "CS-101",
      "faculty": "Dr. Meera Iyer"
    }
  ]
}
```

For users/{userId} document:
```json
{
  "name": "Ananya Ravikumar",
  "usn": "1RV21CS045",
  "branch": "Computer Science & Engineering",
  "semester": "6th Semester",
  "year": "3rd Year",
  "section": "C",
  "phone": "+91 98765 43210",
  "email": "ananya.rv21cs045@rvce.edu.in",
  "avatar": "AR",
  "dob": "12 March 2003",
  "hostel": "Day Scholar",
  "attendance": "84%",
  "cgpa": "8.7",
  "credits": "142",
  "backlogs": "0"
}
```