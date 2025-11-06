const HSCPreviousYear = require("../models/hscPreviousYearQuestions");

// ✅ CREATE NEW HSC PREVIOUS YEAR EXAM
exports.createHSCExam = async (req, res) => {
  try {
    const { examYear, hscGroup, hscBoard, subjects } = req.body;

    // Basic validation
    if (!examYear || !hscGroup || !hscBoard || !subjects) {
      return res.status(400).json({
        success: false,
        message: "examYear, hscGroup, hscBoard, and subjects are required.",
      });
    }

    // Create new HSC exam document
    const exam = new HSCPreviousYear({
      examYear,
      hscGroup,
      hscBoard,
      subjects,
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: "HSC Previous Year Exam created successfully.",
      data: exam,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create HSC exam.",
    });
  }
};

//checking duplicate
// Example: HSC duplicate check
exports.checkDuplicate = async (req, res) => {
  try {
    const { examYear, hscGroup, hscBoard } = req.query; // <-- use req.query

    if (!examYear || !hscGroup || !hscBoard) {
      return res.status(400).json({
        exists: false,
        message: "examYear, hscGroup, and hscBoard are required",
      });
    }

    const exists = await HSCPreviousYear.findOne({
      examYear,
      hscGroup,
      hscBoard,
    });

    if (exists) {
      return res.json({
        exists: true,
        message: `HSC exam already exists for ${hscGroup}, ${hscBoard}, ${examYear}`,
      });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false, message: err.message });
  }
};

// ✅ GET ALL HSC EXAMS
exports.getAllHSCExams = async (req, res) => {
  try {
    const exams = await HSCPreviousYear.find().sort({ examYear: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ GET HSC EXAM BY YEAR + hscGroup + hscBoard
exports.getHSCExam = async (req, res) => {
  try {
    const { year, hscGroup, hscBoard } = req.params;

    const exam = await HSCPreviousYear.findOne({
      examYear: parseInt(year),
      hscGroup,
      hscBoard,
    });

    if (!exam)
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });

    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ GET RANDOM QUESTIONS BY SUBJECT (optional limit)
exports.getRandomHSCQuestionsBySubject = async (req, res) => {
  try {
    const { subjectName, limit } = req.params;

    // Validate and parse limit
    const numLimit = limit ? parseInt(limit, 10) : 20;
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ success: false, message: "Invalid limit" });
    }

    if (!subjectName || typeof subjectName !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subject name" });
    }

    // Find exams that have the subject (case-insensitive)
    const exams = await HSCPreviousYear.find({
      "subjects.name": { $regex: new RegExp(`^${subjectName}$`, "i") },
    });

    if (!exams.length) {
      // Return an empty structured response for consistent client handling
      return res.json({
        success: true,
        data: {
          _id: null,
          duration: null,
          totalQuestions: 0,
          subjects: [],
        },
      });
    }

    // Collect all questions from the matching subject
    let allQuestions = [];
    exams.forEach((exam) => {
      exam.subjects.forEach((sub) => {
        if (sub.name.toLowerCase() === subjectName.toLowerCase()) {
          allQuestions.push(
            ...(Array.isArray(sub.questions) ? sub.questions : [])
          );
        }
      });
    });

    if (!allQuestions.length) {
      // Return structured response with empty questions array to avoid client errors
      return res.json({
        success: true,
        data: {
          _id: exams[0]._id,
          duration: exams[0].duration || null,
          totalQuestions: 0,
          subjects: [
            {
              name: subjectName,
              questions: [],
              totalQuestions: 0,
            },
          ],
        },
      });
    }

    // Shuffle the questions array randomly
    allQuestions.sort(() => 0.5 - Math.random());

    // Pick the requested limited number of questions
    const randomQuestions = allQuestions.slice(0, numLimit);

    // Prepare response as a single exam object with subjects array
    const response = {
      _id: exams[0]._id,
      duration: exams[0].duration || null,
      totalQuestions: randomQuestions.length,
      subjects: [
        {
          name: subjectName,
          questions: randomQuestions,
          totalQuestions: randomQuestions.length,
        },
      ],
    };

    return res.json({ success: true, data: response });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
