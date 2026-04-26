export function rnd(n: number): number {
  return Math.round(n * 100) / 100;
}

export const fmt = (n: number): string =>
  n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
