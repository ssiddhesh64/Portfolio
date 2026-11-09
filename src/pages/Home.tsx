import React from 'react';
import { useMetadata } from '../hooks/useMetadata';
import { Hero } from '../sections/Hero';
import { Experience } from '../sections/Experience';
import { Projects } from '../sections/Projects';
import { Skills } from '../sections/Skills';
import { Writing } from '../sections/Writing';
import { Education } from '../sections/Education';
import { Contact } from '../sections/Contact';

export const Home: React.FC = () => {
  useMetadata({
    title:
      'Siddhesh Sawant | Software Engineer | Backend & Distributed Systems',
    description:
      'Software Engineer with 5+ years of experience building scalable microservices, distributed systems, event-driven architectures, and cloud-native applications.',
    canonicalPath: '/',
  });

  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Writing />
      <Education />
      <Contact />
    </>
  );
};
