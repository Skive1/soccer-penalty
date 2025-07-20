export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
  }
  
  export interface Team {
    name: string;
    flag: string;
    score: number;
  }