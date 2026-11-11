/**
 * Projects on the home page.
 *
 * Every claim here should be checkable from a link on the same card: the
 * repository, the live site, or the diagram drawn from the code. Commit
 * counts and push dates come from src/data/repoStats.json, which
 * `npm run repo-stats` regenerates from the `repos` lists in this file.
 */

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'repo' | 'demo' | 'post';
}

export interface ProjectFact {
  value: string;
  label: string;
}

export interface ProjectDecision {
  title: string;
  body: string;
}

export interface ProjectShot {
  src: string;
  alt: string;
  width: number;
  height: number;
  device: 'desktop' | 'mobile';
}

export interface Project {
  id: string;
  name: string;
  /** featured: the full-width case study. selected: the cards under it. */
  tier: 'featured' | 'selected';
  period: string;
  /** Short status chips, e.g. "Live" or "In progress". */
  status?: { label: string; tone: 'live' | 'progress' | 'neutral' }[];
  role?: string;
  summary: string;
  /** Who it is for and what was wrong before. Featured only. */
  problem?: string;
  facts: ProjectFact[];
  decisions: ProjectDecision[];
  /** What I would change next. Shows the work is understood, not just shipped. */
  next?: string;
  stack: string[];
  links: ProjectLink[];
  /** GitHub "owner/name" of each repo whose stats show on the card. */
  repos: string[];
  /** Mermaid flowchart, drawn from the code. */
  architecture?: string;
  architectureCaption?: string;
  shots?: ProjectShot[];
  /** A command a reviewer can paste to run it locally. */
  run?: string;
}

export interface EarlierProject {
  id: string;
  name: string;
  date: string;
  summary: string;
  stack: string[];
  repo?: string;
}

const GH = 'https://github.com/ssiddhesh64';

export const projects: Project[] = [
  {
    id: 'royal-motors',
    name: 'Royal Motor Training School',
    tier: 'featured',
    period: 'Aug 2025 – present',
    status: [
      { label: 'Site live', tone: 'live' },
      { label: 'Booking API in progress', tone: 'progress' },
    ],
    role: 'Freelance client work. Sole developer, design to deployment.',
    summary:
      'Website and booking backend for a driving school in Malad East, Mumbai, running since 1989.',
    problem:
      'The school ran on phone calls, walk-ins and a paper register. Students had no way to see courses, prices or the documents they needed before visiting, and lesson slots were tracked by hand, which led to double bookings.',
    facts: [
      { value: '8', label: 'pages live, including services, FAQ and gallery' },
      { value: '80', label: 'questions in the RTO mock-test bank' },
      { value: '15 / 30', label: 'questions / minutes per timed test' },
    ],
    decisions: [
      {
        title: 'Lock the slot row, not the table',
        body: 'A booking reads its slot with a pessimistic write lock (SELECT … FOR UPDATE) inside one transaction, checks capacity, then increments the count. Two students racing for the last seat are serialised; the second gets a SlotFullException instead of a double booking.',
      },
      {
        title: 'Leads go to WhatsApp, not a database',
        body: 'Staff already run the school from WhatsApp, so the enquiry form opens a chat with the message pre-filled. Nothing to host or pay for until bookings need a server.',
      },
      {
        title: 'Hash routes on GitHub Pages',
        body: 'Pages cannot rewrite unknown paths to index.html, so the site uses HashRouter, and a 404.html sends deep links to their hash route instead of a dead page.',
      },
    ],
    next: 'Point the site’s “Book driving lesson” button at the booking API and run it on PostgreSQL instead of the H2 dev database.',
    stack: [
      'React 19',
      'Vite',
      'Tailwind CSS',
      'Java 17',
      'Spring Boot',
      'Spring Data JPA',
      'PostgreSQL',
    ],
    links: [
      {
        label: 'Live site',
        href: 'https://ssiddhesh64.github.io/royal-motors-frontend/',
        kind: 'demo',
      },
      { label: 'Frontend', href: `${GH}/royal-motors-frontend`, kind: 'repo' },
      {
        label: 'Booking API',
        href: `${GH}/royal-motor-training-school-backend`,
        kind: 'repo',
      },
    ],
    repos: [
      'ssiddhesh64/royal-motors-frontend',
      'ssiddhesh64/royal-motor-training-school-backend',
    ],
    architecture: `flowchart TB
  V([Student]) --> S["React site · GitHub Pages"]
  S -->|"enquiry, pre-filled"| W([WhatsApp to school staff])
  S -.->|"POST /bookings"| C[BookingController]
  C --> B["BookingService · @Transactional"]
  B -->|"SELECT … FOR UPDATE"| P[("PostgreSQL: slots, bookings")]
  class B key`,
    architectureCaption:
      'Solid: live today. Dashed: the booking API, in progress. The slot row lock is what prevents double bookings.',
    shots: [
      {
        src: '/projects/royal-motors-home.webp',
        alt: 'Royal Motor Training School home page: an instructor and a student in a car, above a bar of figures: 2 lakh+ students trained, 35+ years.',
        width: 1600,
        height: 1000,
        device: 'desktop',
      },
      {
        src: '/projects/royal-motors-mobile.webp',
        alt: 'The same home page on a phone.',
        width: 600,
        height: 1298,
        device: 'mobile',
      },
    ],
  },
  {
    id: 'wikipedia-search',
    name: 'Wikipedia search engine',
    tier: 'selected',
    period: 'Built 2019 · rewritten 2026',
    summary:
      'Full-text search over a 21 GB Wikipedia dump, in Python with no external dependencies.',
    facts: [
      { value: '21 GB', label: 'dump indexed' },
      { value: '17', label: 'unit tests' },
      { value: '0', label: 'dependencies' },
    ],
    decisions: [
      {
        title: 'Postings on disk, offsets in memory',
        body: 'Only a term → byte-offset map stays in RAM. A query seeks straight to its postings in one binary file, so memory stays flat however large the dump is.',
      },
      {
        title: 'VByte and delta encoding',
        body: 'Doc IDs are stored as gaps, and small gaps take one byte instead of four.',
      },
      {
        title: 'BM25 over TF-IDF',
        body: 'BM25 saturates repeated terms and normalises for article length. TF-IDF is still there to compare against, and stored word positions boost exact phrase matches.',
      },
    ],
    next: 'The benchmark script runs on the bundled sample corpus. Publishing latency over the full dump is next.',
    stack: ['Python', 'SQLite', 'Docker', 'GitHub Actions'],
    links: [
      { label: 'Source', href: `${GH}/Wikipedia-Search-Engine`, kind: 'repo' },
      {
        label: 'Case study',
        href: `${GH}/Wikipedia-Search-Engine/blob/main/CASE_STUDY.md`,
        kind: 'post',
      },
    ],
    repos: ['ssiddhesh64/Wikipedia-Search-Engine'],
    architecture: `flowchart LR
  subgraph build["Index once"]
    direction TB
    D[("Dump, 21 GB")] --> T[Tokenise, stem] --> C["VByte + delta"] --> P[("postings.bin")]
  end
  subgraph query["Per query"]
    direction TB
    Q([Query]) --> V[("term → offset")] -->|seek| S[Read postings] --> R["BM25 + phrase"] --> K([Top 10])
  end
  build ~~~ query
  class R key`,
    run: 'python3 seed_data.py --offline && python3 app.py',
  },
  {
    id: 'ecommerce-api',
    name: 'E-commerce REST API',
    tier: 'selected',
    period: 'Nov 2025 – Jun 2026',
    summary:
      'A Spring Boot backend for products, users and orders, with JWT auth and transactional checkout.',
    facts: [
      { value: '12', label: 'tests, unit + MockMvc' },
      { value: '4', label: 'controllers' },
      { value: 'JWT', label: 'stateless auth' },
    ],
    decisions: [
      {
        title: 'Records as DTOs',
        body: 'Requests and responses are Java records, so entities, including BCrypt password hashes, never reach the API.',
      },
      {
        title: 'One transaction per order',
        body: 'Stock checks and decrements for every line run in one @Transactional method, so an order that fails halfway rolls back completely.',
      },
      {
        title: 'One error shape',
        body: 'A @RestControllerAdvice maps validation and domain exceptions to the same ApiError JSON.',
      },
    ],
    next: 'Stock is read and decremented without a lock, so two concurrent orders can oversell. A @Version column with a retry would close that gap.',
    stack: ['Java 17', 'Spring Boot 3', 'Spring Security', 'JPA', 'JUnit 5'],
    links: [
      { label: 'Source', href: `${GH}/springboot-ecommerce-api`, kind: 'repo' },
      {
        label: 'How @Transactional works',
        href: '/blog/spring-transactional',
        kind: 'post',
      },
    ],
    repos: ['ssiddhesh64/springboot-ecommerce-api'],
    architecture: `flowchart TB
  A([Client]) --> F[JWT filter] --> Ct[Controllers]
  Ct -->|records| S["Services · @Transactional"]
  S --> R[("JPA · H2")]
  S -.->|exceptions| G[ControllerAdvice]
  G -.->|ApiError JSON| A
  class S key`,
    run: './mvnw spring-boot:run',
  },
];

export const earlierProjects: EarlierProject[] = [
  {
    id: 'mini-torrent',
    name: 'Mini torrent',
    date: 'Aug 2019',
    summary:
      'Peer-to-peer file sharing in C++. Files are split into chunks, so one download pulls different chunks from several seeders in parallel through a thread pool.',
    stack: ['C++', 'Sockets', 'Threads'],
    repo: `${GH}/mini-torrent`,
  },
  {
    id: 'http-server',
    name: 'Multi-threaded HTTP server',
    date: 'Jan 2019',
    summary:
      'An HTTP server in C/C++ whose thread pool hands connections to workers coordinated by condition variables.',
    stack: ['C', 'C++', 'Threads'],
  },
  {
    id: 'mess-portal',
    name: 'Mess portal',
    date: 'Jun 2018',
    summary:
      'Meal booking for a college mess: students change or cancel meals for open dates; staff see counts and edit the menu.',
    stack: ['Python', 'Flask', 'SQLite'],
  },
];
