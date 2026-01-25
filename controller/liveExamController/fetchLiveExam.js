const LiveExam = require("../../models/liveExam"); // Adjust path as needed
const LiveExamSubmission = require("../../models/liveExamSubmission.model");
const LiveExamRegistration = require("../../models/liveExamRegistration.model");

// Fetch active live exams (not ended yet) with comprehensive data
// Filters out exams that the user has already participated in (if authenticated)
const fetchActiveLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();

    // Fetch only published exams that haven't ended
    const exams = await LiveExam.find({
      status: "published",
      endTime: { $gt: currentTime },
    })
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore isDemo isPractice createdAt updatedAt"
      )
      .sort({ startTime: 1 })
      .lean();

    // If user is authenticated, filter out exams they've already participated in
    let filteredExams = exams;
    let userRegistrations = new Map();
    
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Get all exam IDs that the user has already submitted
      const userSubmissions = await LiveExamSubmission.find({ userId })
        .select("examId")
        .lean();
      
      const participatedExamIds = new Set(
        userSubmissions.map((submission) => submission.examId.toString())
      );
      
      // Filter out exams the user has already participated in (except demo exams)
      filteredExams = exams.filter(
        (exam) => exam.isDemo || !participatedExamIds.has(exam._id.toString())
      );

      // Get user's registrations for these exams
      const registrations = await LiveExamRegistration.find({
        userId,
        examId: { $in: filteredExams.map((e) => e._id) },
        status: "registered",
      })
        .select("examId")
        .lean();

      // Create a map of examId -> registration status
      registrations.forEach((reg) => {
        userRegistrations.set(reg.examId.toString(), true);
      });
    }

    // Initialize categorization arrays
    const ongoing = [];
    const upcoming = [];

    // Transform and categorize exams
    const transformedExams = filteredExams.map((exam) => {
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
        isRegistered: req.user && req.user.userId 
          ? userRegistrations.has(exam._id.toString()) 
          : false,
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
        total: filteredExams.length,
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
// Filters out exams that the user has already participated in (if authenticated)
const fetchOngoingLiveExams = async (req, res) => {
  try {
    const currentTime = new Date();

    const ongoingExams = await LiveExam.find({
      startTime: { $lte: currentTime }, // Already started
      endTime: { $gt: currentTime }, // Not yet ended
      status: "published",
    })
      .select(
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore isDemo isPractice"
      )
      .sort({ endTime: 1 }) // Sort by end time (ending soonest first)
      .lean();

    // If user is authenticated, filter out exams they've already participated in
    let filteredExams = ongoingExams;
    let userRegistrations = new Map();
    
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Get all exam IDs that the user has already submitted
      const userSubmissions = await LiveExamSubmission.find({ userId })
        .select("examId")
        .lean();
      
      const participatedExamIds = new Set(
        userSubmissions.map((submission) => submission.examId.toString())
      );
      
      // Filter out exams the user has already participated in (except demo exams)
      filteredExams = ongoingExams.filter(
        (exam) => exam.isDemo || !participatedExamIds.has(exam._id.toString())
      );

      // Get user's registrations for these exams
      const registrations = await LiveExamRegistration.find({
        userId,
        examId: { $in: filteredExams.map((e) => e._id) },
        status: "registered",
      })
        .select("examId")
        .lean();

      registrations.forEach((reg) => {
        userRegistrations.set(reg.examId.toString(), true);
      });
    }

    // Transform data
    const transformedExams = filteredExams.map((exam) => ({
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
      })),
      isRegistered: req.user && req.user.userId 
        ? userRegistrations.has(exam._id.toString()) 
        : false,
    }));

    res.status(200).json({
      success: true,
      message: "Ongoing live exams fetched successfully",
      data: {
        total: filteredExams.length,
        ongoing: filteredExams.length,
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
// Filters out exams that the user has already participated in (if authenticated)
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

    // If user is authenticated, filter out exams they've already participated in
    let filteredExams = upcomingExams;
    let userRegistrations = new Map();
    
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Get all exam IDs that the user has already submitted
      const userSubmissions = await LiveExamSubmission.find({ userId })
        .select("examId")
        .lean();
      
      const participatedExamIds = new Set(
        userSubmissions.map((submission) => submission.examId.toString())
      );
      
      // Filter out exams the user has already participated in (except demo exams)
      filteredExams = upcomingExams.filter(
        (exam) => exam.isDemo || !participatedExamIds.has(exam._id.toString())
      );

      // Get user's registrations for these exams
      const registrations = await LiveExamRegistration.find({
        userId,
        examId: { $in: filteredExams.map((e) => e._id) },
        status: "registered",
      })
        .select("examId")
        .lean();

      registrations.forEach((reg) => {
        userRegistrations.set(reg.examId.toString(), true);
      });
    }

    // Transform data
    const transformedExams = filteredExams.map((exam) => ({
      ...exam,
      id: exam._id,
      subjects: exam.subjects.map((subject) => ({
        name: subject.name,
        questionCount: subject.questions
          ? subject.questions.length
          : subject.questionCount,
        _id: subject._id,
      })),
      isRegistered: req.user && req.user.userId 
        ? userRegistrations.has(exam._id.toString()) 
        : false,
    }));

    res.status(200).json({
      success: true,
      message: "Upcoming live exams fetched successfully",
      data: {
        total: filteredExams.length,
        ongoing: 0,
        upcoming: filteredExams.length,
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

    // Get user's participated exam IDs if authenticated (fetch once, reuse)
    let participatedExamIds = new Set();
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      const userSubmissions = await LiveExamSubmission.find({ userId })
        .select("examId")
        .lean();
      participatedExamIds = new Set(
        userSubmissions.map((submission) => submission.examId.toString())
      );
    }

    const [exams, totalCount] = await Promise.all([
      LiveExam.find(query)
        .select(
          "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore isDemo isPractice createdAt updatedAt"
        )
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LiveExam.countDocuments(query),
    ]);

    // Filter out exams the user has already participated in (except demo exams)
    const filteredExams = exams.filter(
      (exam) => exam.isDemo || !participatedExamIds.has(exam._id.toString())
    );

    // Get counts for all categories (after filtering)
    const [allActiveExams] = await Promise.all([
      LiveExam.find({
        endTime: { $gt: currentTime },
        status: "published",
      }).lean(),
    ]);

    // Filter allActiveExams for counts
    const filteredAllActiveExams = allActiveExams.filter(
      (exam) => !participatedExamIds.has(exam._id.toString())
    );

    const ongoing = filteredAllActiveExams.filter(
      (exam) => new Date(exam.startTime) <= currentTime
    ).length;

    const upcoming = filteredAllActiveExams.filter(
      (exam) => new Date(exam.startTime) > currentTime
    ).length;

    // Transform data to match mock structure
    const transformedExams = filteredExams.map((exam) => ({
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
        total: filteredAllActiveExams.length,
        ongoing: ongoing,
        upcoming: upcoming,
        exams: transformedExams,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredExams.length / parseInt(limit)),
        totalCount: filteredExams.length,
        hasNext: page * limit < filteredExams.length,
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
        "title code examType examMode duration startTime endTime password isPremium subjects status totalQuestions tags passingScore isDemo isPractice createdAt updatedAt"
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
