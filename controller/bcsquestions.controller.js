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

// GET BCS EXAM BY YEAR
exports.getBCSExamByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const exam = await BCSPreviousYear.findOne({ examYear: parseInt(year) });
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

    const exams = await BCSPreviousYear.find({ "subjects.name": subjectName });
    if (!exams.length)
      return res
        .status(404)
        .json({ success: false, message: "No questions found" });

    let allQuestions = [];
    exams.forEach((exam) => {
      exam.subjects.forEach((sub) => {
        if (sub.name.toLowerCase() === subjectName.toLowerCase())
          allQuestions.push(...sub.questions);
      });
    });

    allQuestions.sort(() => 0.5 - Math.random());
    const randomQuestions = allQuestions.slice(0, limit ? parseInt(limit) : 20);

    res.json({ success: true, data: randomQuestions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
