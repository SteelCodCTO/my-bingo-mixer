export function pickLine(
  lines: readonly string[],
  previous: string | null,
  random: () => number = Math.random
): string {
  const pool = lines.length > 1 ? lines.filter((line) => line !== previous) : lines;
  return pool[Math.floor(random() * pool.length)];
}
