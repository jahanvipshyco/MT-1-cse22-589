const express = require("express");

const app = express();
app.use(express.json());

let students = [];
let nextId = 1;

// Returns true if body has name, course (non-empty text) and age (number)
function isValid(body) {
  if (!body) return false;
  const { name, course, age } = body;
  return (
    typeof name === "string" && name.trim() !== "" &&
    typeof course === "string" && course.trim() !== "" &&
    typeof age === "number" && !Number.isNaN(age)
  );
}

function nameExists(name, ignoreId = null) {
  return students.some(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== ignoreId
  );
}

// POST /api/students
app.post("/api/students", (req, res) => {
  if (!isValid(req.body)) return res.status(400).json({ error: "name, course and age are required" });
  const { name, course, age } = req.body;
  if (nameExists(name)) return res.status(409).json({ error: "Student name already exists" });

  const student = { id: nextId++, name: name.trim(), course: course.trim(), age };
  students.push(student);
  res.status(201).json(student);
});

// GET /api/students  (optional ?course=B.Tech)
app.get("/api/students", (req, res) => {
  const { course } = req.query;
  if (course) {
    return res.status(200).json(
      students.filter((s) => s.course.toLowerCase() === course.toLowerCase())
    );
  }
  res.status(200).json(students);
});

// GET /api/students/:id
app.get("/api/students/:id", (req, res) => {
  const student = students.find((s) => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.status(200).json(student);
});

// PUT /api/students/:id
app.put("/api/students/:id", (req, res) => {
  const student = students.find((s) => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });
  if (!isValid(req.body)) return res.status(400).json({ error: "name, course and age are required" });

  const { name, course, age } = req.body;
  if (nameExists(name, student.id)) return res.status(409).json({ error: "Student name already exists" });

  student.name = name.trim();
  student.course = course.trim();
  student.age = age;
  res.status(200).json(student);
});

// DELETE /api/students/:id
app.delete("/api/students/:id", (req, res) => {
  const index = students.findIndex((s) => s.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Student not found" });
  const [removed] = students.splice(index, 1);
  res.status(200).json(removed);
});

app.listen(3000, () => console.log("Server running on port 3000"));