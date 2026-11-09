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
    title: 'Siddhesh Sawant, backend engineer',
    description:
      'Backend engineer working in Java, Spring Boot and Kafka. Experience, projects, and articles on how backend frameworks work underneath.',
    canonicalPath: '/',
  });

  return (
    <>
      <Hero />
      <Experience />
      <Writing />
      <Projects />
      <Skills />
      <Education />
      <Contact />
    </>
  );
};
