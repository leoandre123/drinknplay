export type ResultType = "credits" | "scores" | "ranking";
export interface GameResult {
  type: ResultType;
  data: any[];
}
