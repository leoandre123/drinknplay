const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function GenerateID(length: number) {
  return Array.from(
    { length: length },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function distributeScores(scores: any[], totalScore: number) {
  const sumScores = scores.reduce((s, p) => s + p.score, 0);

  return scores.map((s) => ({
    playerId: s.playerId,
    score: Math.round((s.score / sumScores) * totalScore),
  }));
}
export function distributeCredits(players: any[], totalCredits: number) {
  if (players.length == 0) return [];
  const totalPoints = players.reduce((s, p) => s + p.score, 0);

  // Step 1: ideal allocation
  const allocations = players.map((p) => {
    const exact = (totalCredits * p.score) / totalPoints;
    return {
      ...p,
      exact,
      base: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  // Step 2: distribute remaining credits
  let remaining = totalCredits - allocations.reduce((s, p) => s + p.base, 0);

  allocations.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remaining; i++) {
    allocations[i].base += 1;
  }

  // Step 3: return result
  return allocations.map((p) => ({
    playerId: p.playerId,
    credits: p.base,
  }));
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
