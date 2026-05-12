import { buildFallbackQuiz } from "./src/lib/quiz/fallbackQuiz.ts";

const quizEn1 = buildFallbackQuiz(1, "en", 10);
console.log("Day 1 EN questions:", quizEn1.questions.length);

const quizHe1 = buildFallbackQuiz(1, "he", 10);
console.log("Day 1 HE questions:", quizHe1.questions.length);

const quizEn2 = buildFallbackQuiz(2, "en", 10);
console.log("Day 2 EN questions:", quizEn2.questions.length);

const quizHe2 = buildFallbackQuiz(2, "he", 10);
console.log("Day 2 HE questions:", quizHe2.questions.length);
