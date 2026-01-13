export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

export function geoDistance(pos0: number[], pos1: number[]) {
  const R = 6371e3; // metres
  const φ1 = (pos0[0] * Math.PI) / 180; // φ, λ in radians
  const φ2 = (pos1[0] * Math.PI) / 180;
  const Δφ = ((pos1[0] - pos0[0]) * Math.PI) / 180;
  const Δλ = ((pos1[1] - pos0[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;
  return d;
}
