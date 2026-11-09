/** Year-month strings use the form "2020-08". */
type YearMonth = string;

export interface PersonalInfo {
  name: string;
  lastName: string;
  title: string;
  focus: string;
  intro: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeMeta: string;
}

export interface RoleItem {
  id: string;
  org: string;
  title: string;
  kind: 'full-time' | 'freelance' | 'internship';
  location: string;
  start: YearMonth;
  end?: YearMonth;
  /** Overrides the computed tenure, e.g. for internships counted in weeks. */
  tenureNote?: string;
  details: string[];
  stack: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  summary: string;
  date: string;
  details: string[];
  stack: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  field: string;
  start: YearMonth;
  end: YearMonth;
  details?: string;
}

export const personalInfo: PersonalInfo = {
  name: 'Siddhesh',
  lastName: 'Sawant',
  title: 'Backend engineer',
  focus: 'Backend engineer working in Java, Spring Boot and Kafka.',
  intro:
    'I spent nearly five years at Walmart Global Tech building the Spring Boot services and Kafka pipelines behind parts of its e-commerce platform. I now build backend systems as a freelancer, and write about how the frameworks underneath them actually work.',
  availability: 'Open to full-time backend roles, remote or Bangalore.',
  email: 'ssiddhesh64@gmail.com',
  github: 'https://github.com/ssiddhesh64',
  linkedin: 'https://www.linkedin.com/in/ssiddhesh64/',
  resumeUrl: '/Siddhesh_Resume_Oct_26.pdf',
  resumeFileName: 'Siddhesh_Sawant_Resume.pdf',
  resumeMeta: 'PDF, 34 KB',
};

export const roles: RoleItem[] = [
  {
    id: 'royal-motors',
    org: 'Royal Motors',
    title: 'Software Developer',
    kind: 'freelance',
    location: 'Remote',
    start: '2025-08',
    details: [
      'Building the Spring Boot backend for an appointment booking system: scheduling, slot availability and the booking workflow.',
      'REST APIs for bookings, customer records and appointment tracking.',
      // TODO: verify. Is there a number for how much conflicts dropped?
      'Moved appointment scheduling off a manual process, which reduced double bookings.',
    ],
    stack: ['Java', 'Spring Boot', 'REST'],
  },
  {
    id: 'walmart',
    org: 'Walmart Global Tech',
    title: 'Software Developer 2',
    kind: 'full-time',
    location: 'Bangalore',
    start: '2020-08',
    end: '2025-05',
    details: [
      // TODO: verify 120K–180K requests/day and ~120 ms p95.
      'Built Spring Boot microservices for the e-commerce platform, serving 120K–180K requests a day at about 120 ms p95.',
      // TODO: verify 120 peak TPS and ~100 ms p95. Name the service if you can.
      'Owned a customer-facing service end to end. It peaks at 120 TPS with p95 latency around 100 ms.',
      // TODO: verify 15+ hours/week. Removed "productivity by 40%": restore only with a source.
      'Wrote Python automation for recurring operational work, saving the team over 15 hours a week.',
      // TODO: verify 1M+ events/day, and say what the 40% throughput gain was measured against.
      'Designed Kafka event pipelines processing over 1M events a day, raising throughput by 40%.',
      // TODO: verify ~100K articles/day, and say what an "article" is here.
      'Built a scheduled Azure job that ingests about 100K articles a day, replacing manual data updates.',
    ],
    stack: ['Java', 'Spring Boot', 'Kafka', 'Python', 'Azure'],
  },
  {
    id: 'walmart-intern',
    org: 'Walmart Global Tech',
    title: 'Software Development Intern',
    kind: 'internship',
    location: 'Bangalore',
    start: '2019-05',
    end: '2019-07',
    tenureNote: '10 weeks',
    details: [
      'Built a React Native app that charts point-of-sale device metrics from an SAP HANA backend.',
      'The app also served as a proof of concept for using React Native in internal enterprise apps.',
    ],
    stack: ['React Native', 'SAP HANA'],
  },
];

export const projects: ProjectItem[] = [
  {
    id: 'wikipedia-search',
    name: 'Wikipedia search engine',
    summary: 'Full-text search over a 21 GB Wikipedia dump.',
    date: 'Nov 2019',
    details: [
      'Built a multi-level inverted index so lookups stay fast at that size.',
      // TODO: verify which ranking you used. The old copy said "e.g., TF-IDF/BM25".
      'Ranked results with TF-IDF and returned the top 10 for each query.',
      'Supported field-specific queries as well as plain full-text search.',
    ],
    stack: ['Python', 'Information retrieval'],
  },
  {
    id: 'mini-torrent',
    name: 'Mini torrent',
    summary:
      'Peer-to-peer file sharing in C++, downloading one file from several peers at once.',
    date: 'Aug 2019',
    details: [
      'Split files into chunks so a client can fetch different chunks from different seeders in parallel.',
      'Peers talk over sockets, with a thread per transfer.',
    ],
    stack: ['C++', 'Sockets', 'Threads'],
  },
  {
    id: 'http-server',
    name: 'Multi-threaded HTTP server',
    summary: 'An HTTP server in C/C++ that serves concurrent clients.',
    date: 'Jan 2019',
    details: [
      'Wrote the thread pool that hands incoming connections to worker threads.',
      'Workers coordinate through condition variables.',
    ],
    stack: ['C', 'C++', 'Threads'],
  },
  {
    id: 'friend-recommendation',
    name: 'Friend recommendation',
    summary:
      'Link prediction on a directed social graph from Facebook, framed as binary classification.',
    date: 'Jan 2020',
    details: [
      'Engineered about 50 graph features, including Adamic-Adar and the Jaccard coefficient.',
      // TODO: name the model and the score it reached; "high performance" was removed.
      'Trained a non-linear classifier on those features.',
    ],
    stack: ['Python', 'Graph mining', 'Machine learning'],
  },
  {
    id: 'mess-portal',
    name: 'Mess portal',
    summary: 'A web portal for booking meals in a college mess.',
    date: 'Jun 2018',
    details: [
      'Users can view, change or cancel their meals for any open date.',
      'An admin view shows meal counts and lets staff change the menu.',
    ],
    stack: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS', 'JavaScript'],
  },
];

export const skills: SkillCategory[] = [
  {
    category: 'Languages',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'JavaScript', 'TypeScript'],
  },
  {
    category: 'Frameworks and messaging',
    items: ['Spring Boot', 'Kafka', 'React', 'React Native', 'Flask'],
  },
  {
    category: 'Cloud and infrastructure',
    items: ['Azure', 'GCP', 'Docker', 'Kubernetes', 'Git'],
  },
  {
    category: 'Databases',
    items: [
      'PostgreSQL',
      'Azure Cosmos DB',
      'Elasticsearch',
      'SQLite',
      'SAP HANA',
    ],
  },
];

export const education: EducationItem[] = [
  {
    school: 'IIIT Hyderabad',
    degree: 'M.Tech',
    field: 'Computer Science',
    start: '2018-07',
    end: '2020-05',
    details: 'CGPA 7.32 / 10',
  },
  {
    school: 'K.J. Somaiya College of Engineering, Mumbai',
    degree: 'B.Tech',
    field: 'Electronics and Telecommunication',
    start: '2014-05',
    end: '2018-05',
    // TODO: verify. Is "honours" a formal distinction on your degree?
    details: 'Graduated with honours',
  },
];
