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
