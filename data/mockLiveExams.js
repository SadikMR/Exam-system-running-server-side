// data/mockLiveExams.js

// Generate exam codes
const generateExamCode = (type, index) => {
  const codes = {
    BCS: "BCS",
    HSC: "HSC",
    Bank: "BANK",
  };
  return `${codes[type] || "EXAM"}${String(index).padStart(3, "0")}`;
};

// Mock live exams data that matches your actual MongoDB structure
const mockLiveExams = [
  {
    _id: "64a1b2c3d4e5f6789012345",
    title: "47th BCS Preliminary Mock Test",
    code: generateExamCode("BCS", 1),
    examType: "BCS",
    examMode: "live",
    duration: 180,
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Started 15 mins ago
    endTime: new Date(Date.now() + 165 * 60 * 1000).toISOString(), // Ends in 165 mins
    password: null,
    isPremium: false,
    subjects: [
      {
        name: "বাংলা ভাষা ও সাহিত্য",
        questionCount: 35,
        questions: [
          {
            text: "<p>বাংলা সাহিত্যের আদি নিদর্শন কোনটি?</p>",
            options: [
              "<p>চর্যাপদ</p>",
              "<p>শ্রীকৃষ্ণকীর্তন</p>",
              "<p>মনসামঙ্গল</p>",
              "<p>অন্নদামঙ্গল</p>",
            ],
            correctAnswer: 0,
            explanation: "<p>চর্যাপদ বাংলা সাহিত্যের আদি নিদর্শন</p>",
            difficulty: "medium",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd93250b",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd93250c",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd93250a",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "English Language and Literature",
        questionCount: 35,
        questions: [
          {
            text: "<p>Who wrote 'Romeo and Juliet'?</p>",
            options: [
              "<p>Charles Dickens</p>",
              "<p>William Shakespeare</p>",
              "<p>Jane Austen</p>",
              "<p>Mark Twain</p>",
            ],
            correctAnswer: 1,
            explanation:
              "<p>Romeo and Juliet was written by William Shakespeare</p>",
            difficulty: "easy",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd93250e",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd93250f",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd93250d",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "গণিত",
        questionCount: 15,
        questions: [],
        _id: "68792b0e6719d78abd932510",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "সাধারণ জ্ঞান",
        questionCount: 50,
        questions: [],
        _id: "68792b0e6719d78abd932511",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "বিজ্ঞান",
        questionCount: 15,
        questions: [],
        _id: "68792b0e6719d78abd932512",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    status: "published",
    totalQuestions: 200,
    tags: [],
    passingScore: 40,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    __v: 0,
  },
  {
    _id: "64a1b2c3d4e5f6789012346",
    title: "HSC Physics Complete Model Test",
    code: generateExamCode("HSC", 2),
    examType: "HSC",
    examMode: "live",
    duration: 120,
    startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Starts in 30 mins
    endTime: new Date(Date.now() + 150 * 60 * 1000).toISOString(), // Ends in 150 mins
    password: "physics123",
    isPremium: true,
    subjects: [
      {
        name: "Physics",
        questionCount: 100,
        questions: [
          {
            text: "<p>What is the unit of force?</p>",
            options: [
              "<p>Newton</p>",
              "<p>Joule</p>",
              "<p>Watt</p>",
              "<p>Pascal</p>",
            ],
            correctAnswer: 0,
            explanation: "<p>Newton is the SI unit of force</p>",
            difficulty: "easy",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd932515",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd932516",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd932514",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    status: "published",
    totalQuestions: 100,
    tags: ["subject-wise"],
    passingScore: 50,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    __v: 0,
  },
  {
    _id: "64a1b2c3d4e5f6789012347",
    title: "Combined Bank Officer Recruitment Test",
    code: generateExamCode("Bank", 3),
    examType: "Bank",
    examMode: "live",
    duration: 60,
    startTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // Starts in 45 mins
    endTime: new Date(Date.now() + 105 * 60 * 1000).toISOString(), // Ends in 105 mins
    password: null,
    isPremium: false,
    subjects: [
      {
        name: "English",
        questionCount: 20,
        questions: [
          {
            text: "<p>Choose the correct spelling:</p>",
            options: [
              "<p>Recieve</p>",
              "<p>Receive</p>",
              "<p>Recive</p>",
              "<p>Receave</p>",
            ],
            correctAnswer: 1,
            explanation: "<p>The correct spelling is 'Receive'</p>",
            difficulty: "easy",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd932518",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd932519",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd932517",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "Mathematics",
        questionCount: 20,
        questions: [],
        _id: "68792b0e6719d78abd93251a",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "General Knowledge",
        questionCount: 20,
        questions: [],
        _id: "68792b0e6719d78abd93251b",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "Banking",
        questionCount: 20,
        questions: [],
        _id: "68792b0e6719d78abd93251c",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    status: "published",
    totalQuestions: 80,
    tags: ["model-test"],
    passingScore: 40,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    __v: 0,
  },
  {
    _id: "64a1b2c3d4e5f6789012348",
    title: "HSC Mathematics Subject Test",
    code: generateExamCode("HSC", 4),
    examType: "HSC",
    examMode: "live",
    duration: 150,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Starts in 2 hours
    endTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000).toISOString(), // Ends in 4.5 hours
    password: null,
    isPremium: false,
    subjects: [
      {
        name: "Mathematics",
        questionCount: 60,
        questions: [
          {
            text: "<p>What is the derivative of x²?</p>",
            options: ["<p>2x</p>", "<p>x</p>", "<p>x²</p>", "<p>2x²</p>"],
            correctAnswer: 0,
            explanation: "<p>The derivative of x² is 2x</p>",
            difficulty: "medium",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd93251e",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd93251f",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd93251d",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    status: "published",
    totalQuestions: 60,
    tags: ["subject-wise"],
    passingScore: 45,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    __v: 0,
  },
  {
    _id: "64a1b2c3d4e5f6789012349",
    title: "BCS General Knowledge Test",
    code: generateExamCode("BCS", 5),
    examType: "BCS",
    examMode: "live",
    duration: 90,
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Starts in 4 hours
    endTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(), // Ends in 5.5 hours
    password: null,
    isPremium: true,
    subjects: [
      {
        name: "সাধারণ জ্ঞান",
        questionCount: 50,
        questions: [
          {
            text: "<p>বাংলাদেশের রাজধানী কোনটি?</p>",
            options: [
              "<p>চট্টগ্রাম</p>",
              "<p>ঢাকা</p>",
              "<p>সিলেট</p>",
              "<p>রাজশাহী</p>",
            ],
            correctAnswer: 1,
            explanation: "<p>বাংলাদেশের রাজধানী ঢাকা</p>",
            difficulty: "easy",
            marks: 1,
            negativeMarks: 0.25,
            _id: "68792b0e6719d78abd932521",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "68792b0e6719d78abd932522",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
        _id: "68792b0e6719d78abd932520",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: "বাংলাদেশ ও বিশ্বপরিচয়",
        questionCount: 40,
        questions: [],
        _id: "68792b0e6719d78abd932523",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    status: "published",
    totalQuestions: 90,
    tags: ["subject-wise"],
    passingScore: 40,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    __v: 0,
  },
];

// Mock API response structure
const mockApiResponse = {
  success: true,
  message: "Live exams fetched successfully",
  data: {
    total: mockLiveExams.length,
    ongoing: mockLiveExams.filter((exam) => {
      const now = new Date();
      return new Date(exam.startTime) <= now && new Date(exam.endTime) > now;
    }).length,
    upcoming: mockLiveExams.filter(
      (exam) => new Date(exam.startTime) > new Date()
    ).length,
    exams: mockLiveExams.map((exam) => ({
      ...exam,
      id: exam._id, // Add id field for compatibility
    })),
  },
};

module.exports = { mockLiveExams, mockApiResponse };
