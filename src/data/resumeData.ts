/** Year-month strings use the form "2020-08". */
type YearMonth = string;

export interface PersonalInfo {
  name: string;
  lastName: string;
  title: string;
  focus: string;
  intro: string;
  availability: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeMeta: string;
  /** Areas the experience above backs up. Used as Person.knowsAbout in JSON-LD. */
  expertise: string[];
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
  /** The team within the org, shown in place of the title when there are positions. */
  team?: string;
  /** Bullets for the role as a whole. Position bullets live under `positions`. */
  details: string[];
  /** Titles held within the role, newest first, e.g. after a promotion. */
  positions?: PositionItem[];
  stack: string[];
}

export interface PositionItem {
  title: string;
  start: YearMonth;
  end?: YearMonth;
  details: string[];
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

/** Which mark to draw beside a skill. See src/components/SkillIcon.tsx. */
export type SkillIconId =
  | 'java'
  | 'python'
  | 'cpp'
  | 'sql'
  | 'javascript'
  | 'typescript'
  | 'spring-boot'
  | 'kafka'
  | 'react'
  | 'flask'
  | 'scikit-learn'
  | 'numpy'
  | 'azure'
  | 'gcp'
  | 'docker'
  | 'kubernetes'
  | 'git'
  | 'postgresql'
  | 'cosmos-db'
  | 'elasticsearch'
  | 'sqlite'
  | 'sap';

/**
 * Evidence that a stack list or article tag can't express. Everything else
 * the Skills section shows is derived from `roles`, `projects` and article
 * tags, so a skill only ever points at things that are on the site.
 */
export type SkillEvidence =
  /** A role on the site, with a note on how the skill was used there. */
  | { kind: 'role'; roleId: string; note: string }
  | { kind: 'article'; slug: string; note: string }
  | { kind: 'link'; title: string; href: string; note: string }
  /** Personal work with nothing on the site to link to. */
  | { kind: 'personal'; note: string };

export interface SkillItem {
  name: string;
  icon: SkillIconId;
  /**
   * Strings in a role/project `stack` or an article's `tags` that count as
   * this skill. Defaults to [name].
   */
  matches?: string[];
  evidence?: SkillEvidence[];
}

export interface SkillCategory {
  category: string;
  items: SkillItem[];
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
  title: 'Backend and machine learning engineer',
  focus:
    'Backend and machine learning engineer working in Java, Spring Boot, Kafka and Python.',
  intro:
    'I spent nearly five years at Walmart Global Tech building the Spring Boot services and Kafka pipelines behind parts of its e-commerce platform. I now build backend systems as a freelancer, and write about how the frameworks underneath them actually work and about machine learning from first principles.',
  availability:
    'Full-time backend or machine learning roles, remote or in Bangalore',
  location: 'Bangalore, India',
  email: 'ssiddhesh64@gmail.com',
  github: 'https://github.com/ssiddhesh64',
  linkedin: 'https://www.linkedin.com/in/ssiddhesh64/',
  resumeUrl: '/resumes/Resume_Nov_2026.pdf',
  resumeFileName: 'Siddhesh_Sawant_Resume.pdf',
  resumeMeta: 'PDF, 48 KB',
  expertise: [
    'Backend engineering',
    'Microservices',
    'Distributed systems',
    'Event-driven architecture',
    'REST APIs',
    'Machine learning',
    'Information retrieval',
  ],
};

export const roles: RoleItem[] = [
  {
    id: 'freelance',
    org: 'Self-employed',
    title: 'Freelance Backend Engineer',
    kind: 'freelance',
    location: 'Remote',
    start: '2025-12',
    details: [
      'Royal Motors (automotive services, Dec 2025 – Mar 2026): designed and built Spring Boot REST APIs for appointment scheduling, slot availability and booking, replacing a fully manual booking process.',
      'Taking on freelance backend work alongside focused upskilling in system design and cloud-native development.',
    ],
    stack: ['Java', 'Spring Boot', 'REST'],
  },
  {
    id: 'walmart',
    org: 'Walmart Global Tech',
    title: 'Software Engineer II',
    team: 'Pricing team, Walmart International',
    kind: 'full-time',
    location: 'Bangalore',
    start: '2020-08',
    end: '2025-05',
    details: [],
    positions: [
      {
        title: 'Software Engineer II',
        start: '2022-08',
        end: '2025-05',
        details: [
          'Owned the design, development and production support of a customer-facing pricing microservice in Java and Spring Boot, serving 120 peak TPS at about 100 ms p95.',
          'Designed Kafka event-driven pipelines that process over 1M price-change events a day, propagating prices to 300+ Massmart stores across Game, Makro and Builders, and improved their throughput by 40%.',
          'Automated operational workflows in Python, saving the team over 15 engineer-hours a week of manual effort.',
        ],
      },
      {
        title: 'Software Engineer I',
        start: '2020-08',
        end: '2022-07',
        details: [
          'Joined a newly formed team building a pricing microservices platform from the ground up, splitting legacy monolithic pricing capabilities into independently scalable services.',
          'Helped migrate pricing data and business capabilities from the monolith to the new microservices, making pricing operations more modular and easier to maintain.',
        ],
      },
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
      'Built a React Native proof-of-concept app on an SAP HANA backend that charts point-of-sale device metrics.',
      'Used it to assess React Native for internal enterprise apps.',
    ],
    stack: ['React Native', 'SAP HANA'],
  },
];

/** Every bullet for a role, including those under its positions. */
export const roleDetails = (role: RoleItem): string[] => [
  ...role.details,
  ...(role.positions ?? []).flatMap((p) => p.details),
];

export const projects: ProjectItem[] = [
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

const PORTFOLIO_REPO = 'https://github.com/ssiddhesh64/Portfolio';

export const skills: SkillCategory[] = [
  {
    category: 'Languages',
    items: [
      { name: 'Java', icon: 'java' },
      { name: 'Python', icon: 'python' },
      { name: 'C/C++', icon: 'cpp', matches: ['C', 'C++'] },
      {
        name: 'SQL',
        icon: 'sql',
        evidence: [
          {
            kind: 'role',
            roleId: 'freelance',
            note: 'Used day to day in client work.',
          },
          { kind: 'role', roleId: 'walmart', note: 'Used day to day at work.' },
          { kind: 'personal', note: 'Used day to day in my own projects.' },
        ],
      },
      { name: 'JavaScript', icon: 'javascript' },
      {
        name: 'TypeScript',
        icon: 'typescript',
        evidence: [
          {
            kind: 'link',
            title: 'This website',
            href: PORTFOLIO_REPO,
            note: 'Written in TypeScript end to end; the source is public.',
          },
        ],
      },
    ],
  },
  {
    category: 'Frameworks and Messaging',
    items: [
      { name: 'Spring Boot', icon: 'spring-boot' },
      { name: 'Kafka', icon: 'kafka' },
      {
        name: 'React',
        icon: 'react',
        evidence: [
          {
            kind: 'link',
            title: 'This website',
            href: PORTFOLIO_REPO,
            note: 'React 19, prerendered to static HTML at build time.',
          },
        ],
      },
      { name: 'React Native', icon: 'react' },
      { name: 'Flask', icon: 'flask' },
    ],
  },
  {
    category: 'Machine Learning',
    items: [
      {
        name: 'scikit-learn',
        icon: 'scikit-learn',
        evidence: [
          {
            kind: 'article',
            slug: 'linear-regression',
            note: 'Its worked examples use scikit-learn models and datasets.',
          },
          {
            kind: 'article',
            slug: 'logistic-regression',
            note: 'Its worked examples use scikit-learn models and datasets.',
          },
        ],
      },
      {
        name: 'NumPy',
        icon: 'numpy',
        evidence: [
          {
            kind: 'article',
            slug: 'linear-regression',
            note: 'Its code examples are written with NumPy.',
          },
          {
            kind: 'article',
            slug: 'logistic-regression',
            note: 'Its code examples are written with NumPy.',
          },
        ],
      },
    ],
  },
  {
    category: 'Cloud and Infrastructure',
    items: [
      { name: 'Azure', icon: 'azure' },
      {
        name: 'GCP',
        icon: 'gcp',
        evidence: [
          {
            kind: 'role',
            roleId: 'walmart',
            note: 'Deployed to GCP when a release required it.',
          },
        ],
      },
      {
        name: 'Docker',
        icon: 'docker',
        evidence: [
          {
            kind: 'role',
            roleId: 'freelance',
            note: 'Used in client work.',
          },
          { kind: 'role', roleId: 'walmart', note: 'Used at work.' },
          { kind: 'personal', note: 'Used in my own projects.' },
        ],
      },
      {
        name: 'Kubernetes',
        icon: 'kubernetes',
        evidence: [
          {
            kind: 'role',
            roleId: 'freelance',
            note: 'Used in client work.',
          },
          { kind: 'role', roleId: 'walmart', note: 'Used at work.' },
          { kind: 'personal', note: 'Used in my own projects.' },
        ],
      },
      { name: 'Git', icon: 'git' },
    ],
  },
  {
    category: 'Databases',
    items: [
      {
        name: 'PostgreSQL',
        icon: 'postgresql',
        evidence: [
          {
            kind: 'role',
            roleId: 'freelance',
            note: 'Used in client projects.',
          },
          {
            kind: 'role',
            roleId: 'walmart',
            note: 'Used in my early work at Walmart.',
          },
        ],
      },
      {
        name: 'Azure Cosmos DB',
        icon: 'cosmos-db',
        evidence: [{ kind: 'role', roleId: 'walmart', note: 'Used at work.' }],
      },
      {
        name: 'Elasticsearch',
        icon: 'elasticsearch',
        evidence: [{ kind: 'role', roleId: 'walmart', note: 'Used at work.' }],
      },
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'SAP HANA', icon: 'sap' },
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
