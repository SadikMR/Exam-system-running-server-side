const BankPreviousYear = require("../models/bankPreviousYearQuestions");

// ✅ Create Bank Exam (Add New Exam with Subjects and Questions)
exports.createBankExam = async (req, res) => {
  try {
    const { examYear, subjects } = req.body;

    if (!examYear || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const newExam = new BankPreviousYear({
      examYear,
      subjects,
    });

    await newExam.save();

    res.status(201).json({
      message: "Bank exam created successfully",
      exam: newExam,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//checking duplicate
exports.checkDuplicate = async (req, res) => {
  try {
    const { examYear } = req.query;

    if (!examYear) {
      return res
        .status(400)
        .json({ exists: false, message: "year is required" });
    }

    const exists = await BankPreviousYear.findOne({ examYear });

    if (exists) {
      return res.json({
        exists: true,
        message: `Bank questions already exist for ${examYear}!`,
      });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false, message: err.message });
  }
};

// ✅ Get All Bank Exams
exports.getAllBankExams = async (req, res) => {
  try {
    const exams = await BankPreviousYear.find();
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Single Bank Exam by ID
exports.getBankExamById = async (req, res) => {
  try {
    const exam = await BankPreviousYear.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Bank Exam
exports.updateBankExam = async (req, res) => {
  try {
    const updatedExam = await BankPreviousYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      message: "Exam updated successfully",
      exam: updatedExam,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Bank Exam
exports.deleteBankExam = async (req, res) => {
  try {
    const deletedExam = await BankPreviousYear.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
