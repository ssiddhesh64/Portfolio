import React from 'react';
import { useMetadata } from '../hooks/useMetadata';
import { personNode, profilePageNode, websiteNode } from '../seo/schema';
import { Hero } from '../sections/Hero';
import { Experience } from '../sections/Experience';
import { Projects } from '../sections/Projects';
import { Skills } from '../sections/Skills';
import { Writing } from '../sections/Writing';
import { Education } from '../sections/Education';
import { Contact } from '../sections/Contact';

const DESCRIPTION =
  'Siddhesh Sawant is a backend and machine learning engineer in Bangalore: Spring Boot and Kafka systems, ML models in Python. Formerly at Walmart Global Tech.';

export const Home: React.FC = () => {
  useMetadata({
    title: 'Siddhesh Sawant | Backend & Machine Learning Engineer',
    description: DESCRIPTION,
    path: '/',
    jsonLd: [websiteNode(), personNode(), profilePageNode(DESCRIPTION)],
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
