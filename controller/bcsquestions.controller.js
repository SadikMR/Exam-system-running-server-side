const BCSPreviousYear = require("../models/bcsPreviousYearQuestions");

// CREATE NEW BCS EXAM
exports.createBCSExam = async (req, res) => {
  try {
    const { examYear, batch, subjects } = req.body;

    // Create new document
    const exam = new BCSPreviousYear({ examYear, batch, subjects });
    await exam.save();

    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// checking duplicates (using GET)
exports.checkDuplicate = async (req, res) => {
  try {
    const { batch } = req.query;

    if (!batch) {
      return res
        .status(400)
        .json({ exists: false, message: "Batch is required" });
    }

    const exists = await BCSPreviousYear.findOne({ batch });

    if (exists) {
      return res.json({
        exists: true,
        message: `BCS questions already exist for Batch ${batch}!`,
      });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false, message: err.message });
  }
};

// GET ALL BCS EXAMS
exports.getAllBCSExams = async (req, res) => {
  try {
    const exams = await BCSPreviousYear.find().sort({ examYear: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET BCS EXAM BY Batch
exports.getBCSExamByYear = async (req, res) => {
  try {
    const { batch } = req.params;
    const exam = await BCSPreviousYear.findOne({ batch: parseInt(batch) });

    if (!exam)
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET RANDOM QUESTIONS BY SUBJECT ACROSS YEARS
exports.getRandomBCSQuestionsBySubject = async (req, res) => {
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
    const exams = await BCSPreviousYear.find({
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
