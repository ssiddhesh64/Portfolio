export interface ExperienceItem {
  org: string;
  role: string;
  duration: string;
  location: string;
  details: string[];
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
  title: 'Backend Engineer · Java · Distributed Systems',
  location: 'Mumbai, India',
  availability: 'Open to backend and platform engineering roles',
  mobile: '+91 8660911187',
  email: 'ssiddhesh64@gmail.com',
  github: 'https://github.com/ssiddhesh64',
  linkedin: 'https://www.linkedin.com/in/ssiddhesh64/',
  summary:
    "I'm a software engineer with 5+ years of experience building backend services at Walmart. I've worked with Java, Spring Boot, Kafka, and SQL, solving problems around API performance, data processing, and reliable services. Outside work, I explore systems engineering and machine learning, and write about the things I learn along the way.",
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
    context: 'Scaled Spring Boot services for high-traffic e-commerce flows.',
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
    label: 'Backend engineering',
    description:
      "I enjoy working on the parts of an application that users don't always see: APIs, database queries, event processing, and the logic that connects everything. I care about making services reliable, understandable, and straightforward to maintain.",
  },
  {
    label: 'Performance and reliability',
    description:
      "A service that works locally is only the beginning. I'm interested in what happens under load, where bottlenecks come from, and how to diagnose problems using metrics, logs, and traces.",
  },
  {
    label: 'Machine learning and AI',
    description:
      "I've also been spending time learning machine learning and building with LLMs. I want to understand how these systems work beyond the API call — from data preparation and retrieval to evaluation and practical applications.",
  },
];

export const proofStories: ProofStory[] = [
  {
    title: 'Scaled E-commerce APIs',
    subtitle: 'Walmart Global Tech',
    metric: '180K req/day',
    description:
      'Built and optimized Spring Boot microservices for customer-facing e-commerce workloads with ~120 ms p95 latency.',
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
      'Worked on backend services for an e-commerce platform, using Java and Spring Boot to implement business logic and support customer-facing functionality. My work involved APIs, data access, and the rules that determine how discounts are applied.',
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
      'Built a website for a driving school to move customer-facing information and parts of its manual workflow online.',
      'Created a responsive React frontend and integrated WhatsApp to make it easier for customers to get in touch.',
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

export const skills: SkillCategory[] = [
  {
    category: 'Languages',
    items: ['Java', 'Python', 'SQL', 'JavaScript', 'TypeScript'],
  },
  {
    category: 'Backend',
    items: ['Spring Boot', 'REST APIs', 'Microservices'],
  },
  {
    category: 'Messaging and data',
    items: ['Kafka', 'Relational databases'],
  },
  {
    category: 'Frontend',
    items: ['React', 'HTML', 'CSS'],
  },
  {
    category: 'Engineering practices',
    items: ['Testing', 'Debugging', 'Performance analysis', 'System design'],
  },
  {
    category: 'Exploring',
    items: ['Machine learning', 'LLMs', 'AI agents'],
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
