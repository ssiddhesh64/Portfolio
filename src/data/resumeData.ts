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
  title: 'Software Engineer | Backend Developer',
  focus: 'Software Engineer | Backend Developer',
  intro:
    'Backend Engineer with over 5 years of experience building and scaling high-performance microservices for large-scale e-commerce platforms. Expertise in Java, Spring Boot, Python, and event-driven architectures, with proven ownership in designing Kafka-based systems, improving system reliability, and delivering high-impact, customer-facing solutions.',
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
      'Built scalable backend APIs using Spring Boot to manage appointment scheduling, slot availability, and booking workflows.',
      'Developed RESTful APIs and microservices-based modules to support booking operations, customer management, and appointment tracking.',
      'Improved operational efficiency and reduced booking conflicts by digitizing manual appointment scheduling.',
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
      'Developed scalable microservices using Java Spring Boot, handling 120K–180K requests/day with p95 latency ~ 120 ms for high traffic e-commerce systems.',
      'Owned and delivered a customer-facing microservice end-to-end, handling 120 Peak TPS and p95 latency ~ 100 ms.',
      'Automated operational workflows using Python, saving 15+ hours/week of manual effort and improving team productivity by 40%.',
      'Designed and implemented Kafka-based event-driven pipelines processing 1M+ events/day, improving system throughput by 40%.',
      'Engineered a cron-scheduled data processing pipeline on Azure Cloud to handle daily article ingestion of approximately 100K articles, reducing manual effort and ensuring consistent, reliable data updates.',
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
      'Developed a React Native mobile application integrated with SAP HANA backend to visualize POS device metrics.',
      'Built a proof-of-concept application to evaluate feasibility and performance of React Native for enterprise use cases.',
    ],
    stack: ['React Native', 'SAP HANA'],
  },
];

export const projects: ProjectItem[] = [
  {
    id: 'wikipedia-search',
    name: 'Wikipedia Search Engine',
    summary: 'Developed an efficient Search Engine for a 21 GB Wikipedia dump.',
    date: 'Nov 2019',
    details: [
      'Implemented multi-level inverted indexing to handle large data efficiently.',
      'Integrated ranking algorithms (e.g., TF-IDF/BM25) to provide highly relevant search results.',
      'Supported field-based queries and returned top 10 relevant results with optimized performance.',
    ],
    stack: ['Python', 'Information retrieval'],
  },
  {
    id: 'mini-torrent',
    name: 'Mini Torrent File Sharing System',
    summary:
      'Developed a peer-to-peer file sharing system in C++ enabling parallel downloads from multiple peers.',
    date: 'Aug 2019',
    details: [
      'Improved download efficiency by allowing simultaneous chunk-based file transfers from multiple seeders.',
    ],
    stack: ['C++', 'Sockets', 'Threads'],
  },
  {
    id: 'http-server',
    name: 'Multi-threaded HTTP Server',
    summary:
      'Built a multi-threaded HTTP server capable of handling concurrent client requests.',
    date: 'Jan 2019',
    details: [
      'Designed a ThreadPool system to efficiently manage and assign worker threads.',
      'Handled thread synchronization with conditional variables to serve multiple clients simultaneously.',
    ],
    stack: ['C', 'C++', 'Threads'],
  },
  {
    id: 'friend-recommendation',
    name: 'Facebook Friend Recommendation',
    summary:
      'Conducted exploratory data analysis based on directed follow-link statistics and mapped it to a binary classification problem.',
    date: 'Jan 2020',
    details: [
      'Engineered about 50 graph features (e.g. Adamic-Adar, Jaccard coefficient) for the prediction model.',
      'Used a non-linear machine learning model to achieve high performance on link prediction metrics.',
    ],
    stack: ['Python', 'Graph mining', 'Machine learning'],
  },
  {
    id: 'mess-portal',
    name: 'Mess Portal',
    summary:
      'Developed a web portal enabling users to view, modify, or cancel meals for any allowed date.',
    date: 'Jun 2018',
    details: [
      'Designed administrative panels to let mess administrators view analytics and change menus.',
    ],
    stack: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS', 'JavaScript'],
  },
];

export const skills: SkillCategory[] = [
  {
    category: 'Programming Languages',
    items: ['Java', 'Python', 'C/C++', 'SQL', 'JavaScript', 'TypeScript'],
  },
  {
    category: 'Frameworks & Tech',
    items: ['Spring Boot', 'Kafka', 'React', 'React Native', 'Flask'],
  },
  {
    category: 'Cloud & Infrastructure',
    items: ['Azure Cloud', 'GCP', 'Docker', 'Kubernetes', 'Git'],
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
    school: 'International Institute of Information Technology Hyderabad',
    degree: 'Masters of Technology',
    field: 'Computer Science',
    start: '2018-07',
    end: '2020-05',
    details: 'CGPA: 7.32 / 10.00',
  },
  {
    school: 'K.J. Somaiya College of Engineering',
    degree: 'Bachelors of Technology',
    field: 'Electronics & Telecommunications Engineering',
    start: '2014-05',
    end: '2018-05',
    details: 'Graduated with honors in E&TC engineering',
  },
];
