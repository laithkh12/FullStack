import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
//import cookieParser from 'cookie-parser';
import multer from 'multer';

// the explination in server_explain file

// 1 
const salt = 10;
const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT"],
    credentials: true
}));
//app.use(cookieParser());

// 2
// Create connection with MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'fsproj'
});

// 3
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage }); // creates an instance of multer configured with the storage settings defined earlier.

// 4
app.post('/register', async (req, res) => {
    const { fname, lname, email, phone, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, salt);

    const checkEmailQuery = `SELECT COUNT(*) AS count FROM studentLogin WHERE email = ? UNION ALL SELECT COUNT(*) FROM teacher WHERE email = ?`;
    db.query(checkEmailQuery, [email, email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).json({ Error: "Database error" });
        }

        const emailCount = results.reduce((total, result) => total + result.count, 0);

        if (emailCount > 0) {
            return res.status(400).json({ Error: "Email already registered" });
        } else {
            const table = role === "Student" ? "studentLogin" : "teacher";
            const insertQuery = `INSERT INTO ${table} (fname, lname, email, phone, password) VALUES (?, ?, ?, ?, ?)`;

            db.query(insertQuery, [fname, lname, email, phone, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error inserting into database:", err.message);
                    return res.status(500).json({ Error: "Database insertion failed" });
                }
                console.log(`${role} registered successfully!`);
                res.json({ Message: `${role} registered successfully!` });
            });
        }
    });
});

// 5
app.get('/login', async (req, res) => {
    const { email, password } = req.query;

    const getTeacherPasswordQuery = 'SELECT password FROM teacher WHERE email = ?';
    db.query(getTeacherPasswordQuery, [email], async (err, teacherResults) => {
        if (err) {
            console.error("Error retrieving password from teacher table:", err.message);
            return res.status(500).json({ Error: "Database error" });
        }

        if (teacherResults.length > 0) {
            const hashedPassword = teacherResults[0].password;
            const passwordMatch = await bcrypt.compare(password, hashedPassword);
            if (passwordMatch) {
                return res.json({ success: true, message: "Login successful", role: "Teacher" });
            } else {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }
        } else {
            const getPasswordQuery = 'SELECT password FROM studentLogin WHERE email = ?';
            db.query(getPasswordQuery, [email], async (err, studentResults) => {
                if (err) {
                    console.error("Error retrieving password from student table:", err.message);
                    return res.status(500).json({ Error: "Database error" });
                }

                if (studentResults.length > 0) {
                    const hashedPassword = studentResults[0].password;
                    const passwordMatch = await bcrypt.compare(password, hashedPassword);
                    if (passwordMatch) {
                        return res.json({ success: true, message: "Login successful", role: "Student" });
                    } else {
                        return res.status(401).json({ success: false, message: "Invalid email or password" });
                    }
                } else {
                    console.log("Email not found in either teacher or student table");
                    return res.status(401).json({ success: false, message: "Invalid email or password" });
                }
            });
        }
    });
});

// 6
app.post('/api/classes', (req, res) => {
    const { cname, id, description, tasks, teacher_email } = req.body;

    // Insert the class into the classes table
    const insertClassQuery = `INSERT INTO classes (cname, cid, description, teacher_email) VALUES (?, ?, ?, ?)`;
    db.query(insertClassQuery, [cname, id, description, teacher_email], (err, classResult) => {
        if (err) {
            console.error("Error inserting class:", err.message);
            return res.status(500).json({ Error: "Database error" });
        }

        const classId = classResult.insertId; // Get the newly inserted class's ID

        // Insert tasks into the tasks table
        if (tasks && tasks.length > 0) {
            const insertTasksQuery = `INSERT INTO tasks (class_id, task_name, percentage) VALUES ?`;
            const tasksData = tasks.map(task => [classId, task.taskName, task.percentage]);

            db.query(insertTasksQuery, [tasksData], (err, taskResult) => {
                if (err) {
                    console.error("Error inserting tasks:", err.message);
                    return res.status(500).json({ Error: "Database error" });
                }

                res.json({ Message: "Class and tasks saved successfully!" });
            });
        } else {
            res.json({ Message: "Class saved successfully without tasks!" });
        }
    });
});

// 7
app.get('/api/classes', async (req, res) => {
    try {
        const classes = await new Promise((resolve, reject) => {
            db.query('SELECT id, cname, cid, description, teacher_email FROM classes', (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        
        // Format the query result into a plain array of objects
        const classData = classes.map(row => ({
            id: row.id,
            cname: row.cname,
            cid: row.cid,
            description: row.description,
            teacher_email: row.teacher_email
        }));
        
        // Send the formatted data as JSON response
        res.json(classData);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 8
app.get('/api/tasks/:classId', async (req, res) => {
    try {
        const classId = req.params.classId;
        const tasks = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM tasks WHERE class_id = ?', [classId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        
        // Send the tasks data as JSON response
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 9
app.post('/api/students', async (req, res) => {
    try {
        const { firstName, lastName, email, age, classId, grades } = req.body;

        // Log the received data for debugging purposes
        console.log('Received data:', { firstName, lastName, email, age, classId, grades });

        // Check if classId is received correctly
        if (!classId || classId === 0) {
            return res.status(400).json({ error: 'Invalid classId' });
        }

        // Convert grades object to JSON string
        const gradesJson = JSON.stringify(grades);

        // Insert student data into the students table
        const insertStudentQuery = 'INSERT INTO students (firstName, lastName, email, age, classId, grades) VALUES (?, ?, ?, ?, ?, ?)';

        await new Promise((resolve, reject) => {
            db.query(insertStudentQuery, [firstName, lastName, email, age, classId, gradesJson], (err, result) => {
                if (err) {
                    console.error("Database error:", err.message, err.stack);
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.status(200).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 10
app.get('/api/classes/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const classes = await new Promise((resolve, reject) => {
            db.query('SELECT id, cname, cid, description, teacher_email FROM classes WHERE teacher_email = ?', [email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const classData = classes.map(row => ({
            id: row.id,
            cname: row.cname,
            cid: row.cid,
            description: row.description,
            teacher_email: row.teacher_email
        }));

        res.json(classData);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 11
app.get('/api/students/:classId', async (req, res) => {
    try {
        const classId = req.params.classId;
        const students = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM students WHERE classId = ?', [classId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 12
app.post('/api/saveAttendance', async (req, res) => {
    try {
        const attendanceRecords = req.body;
        const insertAttendanceQuery = `
            INSERT INTO attendance (class_id, student_id, status, date)
            VALUES ?
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        `;

        // Filter out existing records
        const filteredRecords = [];
        for (let record of attendanceRecords) {
            const { class_id, student_id, date } = record;
            const existingRecord = await new Promise((resolve, reject) => {
                const checkQuery = 'SELECT * FROM attendance WHERE class_id = ? AND student_id = ? AND date = ?';
                db.query(checkQuery, [class_id, student_id, date], (err, results) => {
                    if (err) {
                        console.error("Error checking attendance:", err.message);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            if (existingRecord.length === 0) {
                filteredRecords.push(record);
            }
        }

        // Insert non-duplicate records
        if (filteredRecords.length > 0) {
            await new Promise((resolve, reject) => {
                db.query(insertAttendanceQuery, [filteredRecords.map(record => [record.class_id, record.student_id, record.status, record.date])], (err, result) => {
                    if (err) {
                        console.error("Error inserting attendance:", err.message);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        }

        res.status(200).json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error.message);
        res.status(500).json({ error: 'Failed to save attendance' });
    }
});

// 13
app.post('/api/saveHomework', upload.single('file'), async (req, res) => {
    const { title, description, submissionDate, classId } = req.body;
    const filePath = req.file ? req.file.path : null;

    const insertHomeworkQuery = `
        INSERT INTO homework (class_id, title, description, submission_date, file_path)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertHomeworkQuery, [classId, title, description, submissionDate, filePath], (err, result) => {
        if (err) {
            console.error('Error saving homework:', err.message);
            return res.status(500).json({ error: 'Failed to save homework' });
        }
        res.status(200).json({ message: 'Homework saved successfully' });
    });
});

// 14
app.get('/api/attendance/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Query the database for attendance records associated with the specified student ID
        const attendanceRecords = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM attendance WHERE student_id = ?';
            db.query(query, [studentId], (err, results) => {
                if (err) {
                    console.error("Error fetching attendance records:", err.message);
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Send the attendance records data as JSON response
        res.json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 15
app.put('/api/students/:id', async (req, res) => {
    try {
      const studentId = req.params.id;
      const { grades } = req.body;
  
      const gradesJson = JSON.stringify(grades);
  
      const updateStudentQuery = 'UPDATE students SET grades = ? WHERE id = ?';
  
      await new Promise((resolve, reject) => {
        db.query(updateStudentQuery, [gradesJson, studentId], (err, result) => {
          if (err) {
            console.error("Database error:", err.message, err.stack);
            return reject(err);
          }
          resolve(result);
        });
      });
  
      res.status(200).json({ message: 'Grades updated successfully' });
    } catch (error) {
      console.error('Error updating grades:', error.message, error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.get('/api/students', async (req, res) => {
    try {
      const email = req.query.email;
  
      const studentQuery = 'SELECT * FROM students WHERE email = ?';
      db.query(studentQuery, [email], async (err, results) => {
        if (err) {
          console.error("Error retrieving student data:", err.message);
          return res.status(500).json({ Error: "Database error" });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ Error: "Student not found" });
        }
  
        // Map results to student data format
        const studentsData = results.map(student => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          age: student.age,
          classId: student.classId,
          grades: JSON.parse(student.grades) // Parse grades from JSON string to object
        }));
  
        res.json(studentsData);
      });
    } catch (error) {
      console.error('Error fetching student data:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
app.get('/api/classes/:cid', async (req, res) => {
    try {
      const cid = req.params.cid;
      console.log('Received cid:', cid); // Log received cid
  
      const getClassQuery = 'SELECT cname FROM classes WHERE id = ?'; // Assuming 'id' is the column name
      db.query(getClassQuery, [cid], (err, result) => {
        if (err) {
          console.error('Error retrieving class:', err.message);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (result.length === 0) {
          return res.status(404).json({ error: 'Class not found' });
        }
        
        const { cname } = result[0]; // Destructure to get only cname
        console.log('Class Name:', cname); // Log class name
        res.json({ className: cname }); // Send only cname to frontend
      });
    } catch (error) {
      console.error('Error fetching class:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/homeworks/:classId', async (req, res) => {
    try {
      const classId = req.params.classId;
      const homeworks = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM homework WHERE class_id = ?', [classId], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      res.json(homeworks);
    } catch (error) {
      console.error('Error fetching homeworks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/submitHomework', upload.single('file'), async (req, res) => {
    const { homeworkId } = req.body;
    const filePath = req.file ? req.file.path : null;
    res.status(200).json({ message: 'Homework submitted successfully' });
  });
  
// 16
// Handle database connection errors
db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to MySQL database");
    }
});

// 17
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error("Uncaught exception:", err.message);
    process.exit(1);
});

// 18
// Start the server
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
