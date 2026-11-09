const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const parse = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
};

/** "2020-08" -> "Aug 2020" */
export const formatYearMonth = (ym: string): string => {
  const { y, m } = parse(ym);
  return `${MONTHS[m - 1]} ${y}`;
};

/** "Aug 2020 – May 2025", or "Dec 2025 – Present" when ongoing. */
export const formatRange = (start: string, end?: string): string =>
  `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`;

/** Inclusive month count between two year-months. */
export const monthsBetween = (start: string, end?: string): number => {
  const a = parse(start);
  const now = new Date();
  const b = end ? parse(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  return (b.y - a.y) * 12 + (b.m - a.m) + 1;
};

/** 58 -> "4 yr 10 mo" */
export const formatTenure = (months: number): string => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr`);
  if (rest) parts.push(`${rest} mo`);
  return parts.join(' ') || '1 mo';
};

/** ISO date string from blog frontmatter -> "21 Jun 2026" */
export const formatPostDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
