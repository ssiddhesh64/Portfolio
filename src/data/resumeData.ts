export interface ExperienceItem {
  org: string;
  role: string;
  duration: string;
  location: string;
  details: string[];
}

export interface ProjectItem {
  name: string;
  tech: string;
  date: string;
  details: string[];
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  duration: string;
  details: string;
}

export interface PersonalInfo {
  name: string;
  lastName: string;
  title: string;
  location: string;
  availability: string;
  mobile: string;
  email: string;
  github: string;
  linkedin: string;
  summary: string;
}

export interface ImpactMetric {
  value: string;
  label: string;
  context: string;
  proof: string;
}

export interface PositioningPoint {
  label: string;
  description: string;
}

export interface ProofStory {
  title: string;
  subtitle: string;
  metric: string;
  description: string;
  tags: string[];
}

export const personalInfo: PersonalInfo = {
  name: 'Siddhesh',
  lastName: 'Sawant',
  title: 'Software Engineer | Backend Developer',
  location: 'Bangalore, India',
  availability: 'Open to backend and platform engineering roles',
  mobile: '+91 8660911187',
  email: 'ssiddhesh64@gmail.com',
  github: 'https://github.com/ssiddhesh64',
  linkedin: 'https://www.linkedin.com/in/ssiddhesh64/',
  summary:
    'Backend Engineer with over 5 years of experience building and scaling high-performance microservices for large-scale e-commerce platforms. Expertise in Java, Spring Boot, Python, and event-driven architectures, with proven ownership in designing Kafka-based systems, improving system reliability, and delivering high-impact, customer-facing solutions.',
};

export const impactMetrics: ImpactMetric[] = [
  {
    value: '5+',
    label: 'Years engineering',
    context: 'Backend systems, APIs, automation, and production ownership.',
    proof: 'Walmart Global Tech SDE2 plus freelance backend delivery.',
  },
  {
    value: '180K',
    label: 'Requests/day',
    context: 'Scaled Spring Boot services for high-traffic commerce flows.',
    proof: 'Production services at ~120 ms p95 latency.',
  },
  {
    value: '1M+',
    label: 'Events/day',
    context: 'Kafka-based event pipelines for high-throughput processing.',
    proof: 'Improved system throughput by 40%.',
  },
  {
    value: '120',
    label: 'Peak TPS',
    context: 'Owned customer-facing service delivery end to end.',
    proof: 'Maintained ~100 ms p95 latency.',
  },
  {
    value: '15+',
    label: 'Hours/week saved',
    context: 'Automated operational workflows with Python.',
    proof: 'Improved team productivity by 40%.',
  },
];

export const positioningPoints: PositioningPoint[] = [
  {
    label: 'Backend scale',
    description:
      'Designs Java and Spring Boot microservices that handle real production traffic with latency and reliability targets.',
  },
  {
    label: 'Event-driven systems',
    description:
      'Builds Kafka pipelines, scheduled ingestion jobs, and data flows where throughput and correctness matter.',
  },
  {
    label: 'Operational leverage',
    description:
      'Turns repetitive workflows into automation that saves engineering time and reduces manual failure points.',
  },
];

export const proofStories: ProofStory[] = [
  {
    title: 'Scaled commerce APIs',
    subtitle: 'Walmart Global Tech',
    metric: '180K req/day',
    description:
      'Built and optimized Spring Boot microservices for customer-facing commerce workloads with ~120 ms p95 latency.',
    tags: ['Java', 'Spring Boot', 'Microservices', 'Latency'],
  },
  {
    title: 'Built event pipelines',
    subtitle: 'Walmart Global Tech',
    metric: '1M+ events/day',
    description:
      'Designed Kafka-based pipelines that increased throughput by 40% and supported reliable downstream processing.',
    tags: ['Kafka', 'Distributed Systems', 'Throughput'],
  },
  {
    title: 'Automated operations',
    subtitle: 'Walmart Global Tech',
    metric: '15+ hrs/week',
    description:
      'Automated recurring workflows with Python, improving productivity by 40% and reducing manual operational load.',
    tags: ['Python', 'Automation', 'Reliability'],
  },
];

export const experiences: ExperienceItem[] = [
  {
    org: 'Walmart Global Tech',
    role: 'Software Developer 2',
    duration: 'August 2020 - May 2025',
    location: 'Bangalore',
    details: [
      'Developed scalable microservices using Java Spring Boot, handling 120K–180K requests/day with p95 latency ~ 120 ms for high traffic e-commerce systems.',
      'Owned and delivered a customer-facing microservice end-to-end, handling 120 Peak TPS and p95 latency ~ 100 ms.',
      'Automated operational workflows using Python, saving 15+ hours/week of manual effort and improving team productivity by 40%.',
      'Designed and implemented Kafka-based event-driven pipelines processing 1M+ events/day, improving system throughput by 40%.',
      'Engineered a cron-scheduled data processing pipeline on Azure Cloud to handle daily article ingestion of approximately 100K articles, reducing manual effort and ensuring consistent, reliable data updates.',
    ],
  },
  {
    org: 'Royal Motors',
    role: 'Software Developer - Freelance',
    duration: 'August 2025 - Present',
    location: 'Remote',
    details: [
      'Built scalable backend APIs using Spring Boot to manage appointment scheduling, slot availability, and booking workflows.',
      'Developed RESTful APIs and microservices-based modules to support booking operations, customer management, and appointment tracking.',
      'Improved operational efficiency and reduced booking conflicts by digitizing manual appointment scheduling.',
    ],
  },
  {
    org: 'Walmart Global Tech',
    role: 'Software Development Intern',
    duration: 'May 2019 - July 2019',
    location: 'Bangalore (10 weeks)',
    details: [
      'Developed a React Native mobile application integrated with SAP HANA backend to visualize POS device metrics.',
      'Built a proof-of-concept application to evaluate feasibility and performance of React Native for enterprise use cases.',
    ],
  },
];

export const projects: ProjectItem[] = [
  {
    name: 'Wikipedia Search Engine',
    tech: 'Python | Information Retrieval',
    date: 'November 2019',
    details: [
      'Developed an efficient Search Engine for a 21 GB Wikipedia dump.',
      'Implemented multi-level inverted indexing to handle large data efficiently.',
      'Integrated ranking algorithms (e.g., TF-IDF/BM25) to provide highly relevant search results.',
      'Supported field-based queries and returned top 10 relevant results with optimized performance.',
    ],
    tags: ['Information Retrieval', 'Python', 'Systems'],
  },
  {
    name: 'Mini Torrent File Sharing System',
    tech: 'C++ | Socket Programming | Threading',
    date: 'August 2019',
    details: [
      'Developed a peer-to-peer file sharing system in C++ enabling parallel downloads from multiple peers.',
      'Improved download efficiency by allowing simultaneous chunk-based file transfers from multiple seeders.',
    ],
    tags: ['Systems', 'C++', 'Networking'],
  },
  {
    name: 'Multi-threaded HTTP Server',
    tech: 'C/C++ | Multi-threading',
    date: 'January 2019',
    details: [
      'Built a multi-threaded HTTP server capable of handling concurrent client requests.',
      'Designed a ThreadPool system to efficiently manage and assign worker threads.',
      'Handled thread synchronization with conditional variables to serve multiple clients simultaneously.',
    ],
    tags: ['Systems', 'C/C++', 'Networking'],
  },
  {
    name: 'Facebook Friend Recommendation',
    tech: 'Python | Graph Mining | Machine Learning',
    date: 'January 2020',
    details: [
      'Conducted exploratory data analysis based on directed follow-link statistics and mapped it to a binary classification problem.',
      'Engineered about 50 graph features (e.g. Adamic-Adar, Jaccard coefficient) for the prediction model.',
      'Used a non-linear machine learning model to achieve high performance on link prediction metrics.',
    ],
    tags: ['Machine Learning', 'Python'],
  },
  {
    name: 'Mess Portal',
    tech: 'Python | Flask | SQLite | HTML/CSS/JS',
    date: 'June 2018',
    details: [
      'Developed a web portal enabling users to view, modify, or cancel meals for any allowed date.',
      'Designed administrative panels to let mess administrators view analytics and change menus.',
    ],
    tags: ['Web', 'Python', 'Database'],
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
    degree: 'Masters of Technology in Computer Science',
    duration: 'July 2018 - May 2020',
    details: 'CGPA: 7.32 / 10.00',
  },
  {
    school: 'K.J. Somaiya College of Engineering',
    degree:
      'Bachelors of Technology in Electronics & Telecommunications Engineering',
    duration: 'May 2014 - May 2018',
    details: 'Graduated with honors in E&TC engineering',
  },
];
