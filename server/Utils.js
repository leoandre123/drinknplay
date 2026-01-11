const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function GenerateID(length) {
  return Array.from(
    { length: length },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function distributeScores(scores, totalScore) {
  const sumScores = scores.reduce((s, p) => s + p.score, 0);

  return scores.map((s) => ({
    playerId: s.playerId,
    score: (s.score / sumScores) * totalScore,
  }));
}
export function distributeCredits(players, totalCredits) {
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
