export type KahootQuestion = {
  id: string;
  answers: {
    id: string;
    correct: boolean;
  }[];
};

export type KahootPlayer = {
  playerId: string;
  score: 0;
  hasAnswered: boolean;
};
