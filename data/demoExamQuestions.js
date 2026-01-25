// data/demoExamQuestions.js

const demoExamQuestions = {
  title: "Demo Live Exam - Try Our Platform",
  examType: "BCS",
  duration: 10,
  subjects: [
    {
      name: "General Knowledge",
      questionCount: 8,
      questions: [
        {
          text: "What is the capital of Bangladesh?",
          options: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"],
          correctAnswer: 0,
          explanation: "Dhaka is the capital and largest city of Bangladesh.",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "Who is known as the Father of the Nation in Bangladesh?",
          options: [
            "Ziaur Rahman",
            "Sheikh Mujibur Rahman",
            "Hussain Muhammad Ershad",
            "A.K. Fazlul Huq",
          ],
          correctAnswer: 1,
          explanation:
            "Sheikh Mujibur Rahman is known as the Father of the Nation (Bangabandhu) in Bangladesh.",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "When did Bangladesh gain independence?",
          options: ["1947", "1952", "1971", "1991"],
          correctAnswer: 2,
          explanation:
            "Bangladesh gained independence from Pakistan on December 16, 1971.",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "What is the national flower of Bangladesh?",
          options: ["Rose", "Shapla (Water Lily)", "Lotus", "Jasmine"],
          correctAnswer: 1,
          explanation:
            "Shapla (White Water Lily) is the national flower of Bangladesh.",
          difficulty: "medium",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "Which river is known as the lifeline of Bangladesh?",
          options: ["Meghna", "Jamuna", "Padma", "All of the above"],
          correctAnswer: 3,
          explanation:
            "The Padma, Meghna, and Jamuna rivers together form the lifeline of Bangladesh.",
          difficulty: "medium",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "What is the longest sea beach in the world located in Bangladesh?",
          options: ["Kuakata", "Cox's Bazar", "Patenga", "Saint Martin"],
          correctAnswer: 1,
          explanation:
            "Cox's Bazar is the longest natural sea beach in the world, stretching 120 km.",
          difficulty: "medium",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "Which UNESCO World Heritage Site is located in Bangladesh?",
          options: [
            "Lalbagh Fort",
            "Ahsan Manzil",
            "Sundarbans",
            "Paharpur",
          ],
          correctAnswer: 2,
          explanation:
            "The Sundarbans is a UNESCO World Heritage Site, home to the Royal Bengal Tiger.",
          difficulty: "hard",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "What is the national anthem of Bangladesh?",
          options: [
            "Amar Sonar Bangla",
            "Ekushey February",
            "Dhono Dhanne Pushpe Bhora",
            "O Amar Desher Mati",
          ],
          correctAnswer: 0,
          explanation:
            "Amar Sonar Bangla, written by Rabindranath Tagore, is the national anthem of Bangladesh.",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
      ],
    },
    {
      name: "Mathematics",
      questionCount: 2,
      questions: [
        {
          text: "What is 15% of 200?",
          options: ["20", "25", "30", "35"],
          correctAnswer: 2,
          explanation: "15% of 200 = (15/100) × 200 = 30",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
        {
          text: "If x + 5 = 12, what is the value of x?",
          options: ["5", "6", "7", "8"],
          correctAnswer: 2,
          explanation: "x + 5 = 12, therefore x = 12 - 5 = 7",
          difficulty: "easy",
          marks: 1,
          negativeMarks: 0,
        },
      ],
    },
  ],
  totalQuestions: 10,
  passingScore: 40,
};

module.exports = demoExamQuestions;
