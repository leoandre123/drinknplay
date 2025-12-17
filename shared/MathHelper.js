export function mod(n, m) {
  return ((n % m) + m) % m;
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
