const LiveExam = require("../../models/liveExam"); // Adjust path as needed

// Fetch active live exams (not ended yet) with comprehensive data
const fetchActiveLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();

    // Fetch only published exams that haven't ended
    const exams = await LiveExam.find({
      status: "published",
      endTime: { $gt: currentTime },
    })
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore createdAt updatedAt"
      )
      .sort({ startTime: 1 })
      .lean();

    // Initialize categorization arrays
    const ongoing = [];
    const upcoming = [];

    // Transform and categorize exams
    const transformedExams = exams.map((exam) => {
      const start = new Date(exam.startTime);
      const isOngoing = start <= currentTime;

      // Keep subjects WITH questions array included
      const fullSubjects =
        exam.subjects?.map((subject) => ({
          name: subject.name,
          questionCount:
            subject.questions?.length || subject.questionCount || 0,
          questions: subject.questions || [], // ✅ Include questions array
          _id: subject._id,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
        })) || [];

      // Create exam object with questions
      const examWithQuestions = {
        ...exam,
        id: exam._id.toString(),
        subjects: fullSubjects,
      };

      // Categorize exam
      if (isOngoing) {
        ongoing.push(examWithQuestions);
      } else {
        upcoming.push(examWithQuestions);
      }

      return examWithQuestions;
    });

    res.status(200).json({
      success: true,
      message: "Live exams fetched successfully",
      data: {
        total: exams.length,
        ongoing: ongoing.length,
        upcoming: upcoming.length,
        exams: transformedExams,
      },
    });
  } catch (error) {
    console.error("Error fetching live exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active live exams",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Fetch only ongoing exams (started but not ended)
const fetchOngoingLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();

    const ongoingExams = await LiveExam.find({
      startTime: { $lte: currentTime }, // Already started
      endTime: { $gt: currentTime }, // Not yet ended
      status: "published",
    })
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore"
      )
      .sort({ endTime: 1 }) // Sort by end time (ending soonest first)
      .lean();

    // Transform data
    const transformedExams = ongoingExams.map((exam) => ({
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Ongoing live exams fetched successfully",
      data: {
        total: ongoingExams.length,
        ongoing: ongoingExams.length,
        upcoming: 0,
        exams: transformedExams,
      },
    });
  } catch (error) {
    console.error("Error fetching ongoing live exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ongoing live exams",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Fetch upcoming exams (not started yet)
const fetchUpcomingLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();

    const upcomingExams = await LiveExam.find({
      startTime: { $gt: currentTime }, // Not yet started
      status: "published",
    })
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore"
      )
      .sort({ startTime: 1 }) // Sort by start time (earliest first)
      .lean();

    // Transform data
    const transformedExams = upcomingExams.map((exam) => ({
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Upcoming live exams fetched successfully",
      data: {
        total: upcomingExams.length,
        ongoing: 0,
        upcoming: upcomingExams.length,
        exams: transformedExams,
      },
    });
  } catch (error) {
    console.error("Error fetching upcoming live exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming live exams",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Comprehensive controller with filtering and pagination
const fetchLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();
    const {
      page = 1,
      limit = 10,
      status = "active", // 'active', 'ongoing', 'upcoming'
      examType, // 'BCS', 'HSC', 'Bank'
      search = "",
      isPremium,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build base query
    let query = {
      status: "published", // Only published exams
    };

    // Add time-based filtering
    switch (status) {
      case "active":
        query.endTime = { $gt: currentTime };
        break;
      case "ongoing":
        query = {
          ...query,
          startTime: { $lte: currentTime },
          endTime: { $gt: currentTime },
        };
        break;
      case "upcoming":
        query.startTime = { $gt: currentTime };
        break;
      default:
        query.endTime = { $gt: currentTime };
    }

    // Add exam type filter
    if (examType) {
      query.examType = examType;
    }

    // Add premium filter
    if (isPremium !== undefined) {
      query.isPremium = isPremium === "true";
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { examType: { $regex: search, $options: "i" } },
      ];
    }

    const [exams, totalCount] = await Promise.all([
      LiveExam.find(query)
        .select(
          "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore createdAt updatedAt"
        )
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LiveExam.countDocuments(query),
    ]);

    // Get counts for all categories
    const [allActiveExams] = await Promise.all([
      LiveExam.find({
        endTime: { $gt: currentTime },
        status: "published",
      }).lean(),
    ]);

    const ongoing = allActiveExams.filter(
      (exam) => new Date(exam.startTime) <= currentTime
    ).length;

    const upcoming = allActiveExams.filter(
      (exam) => new Date(exam.startTime) > currentTime
    ).length;

    // Transform data to match mock structure
    const transformedExams = exams.map((exam) => ({
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Live exams fetched successfully",
      data: {
        total: allActiveExams.length,
        ongoing: ongoing,
        upcoming: upcoming,
        exams: transformedExams,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching live exams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch live exams",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get single exam by ID (for exam details)
const fetchLiveExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const currentTime = new Date();

    const exam = await LiveExam.findById(examId)
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore createdAt updatedAt"
      )
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Check if exam is still active
    if (new Date(exam.endTime) <= currentTime) {
      return res.status(400).json({
        success: false,
        message: "This exam has already ended",
      });
    }

    // Transform data (don't include full questions for security)
    const transformedExam = {
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Exam details fetched successfully",
      data: transformedExam,
    });
  } catch (error) {
    console.error("Error fetching exam details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam details",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  fetchActiveLiveExams,
  fetchOngoingLiveExams,
  fetchUpcomingLiveExams,
  fetchLiveExams,
  fetchLiveExamById,
};
