import type { ComponentType } from 'react';
import { OutlierPull } from '../sections/specimens/OutlierPull';
import { ThresholdSlide } from '../sections/specimens/ThresholdSlide';
import { LostKey } from '../sections/specimens/LostKey';
import { PropagationFate } from '../sections/specimens/PropagationFate';
import { ContentHash } from '../sections/specimens/ContentHash';
import { BeanStages } from '../sections/specimens/BeanStages';

/**
 * How each article is pitched on the home page: the question a reader
 * actually has, the short answer, and a small working piece of the
 * article's own demo. Keyed by article slug. An article without an entry
 * falls back to its title and summary, with no specimen.
 */
export interface WritingHook {
  question: string;
  answer: string;
  /** A small interactive drawn from the article. */
  Specimen: ComponentType;
  /** What to do with the specimen, in a few words. */
  prompt: string;
}

export const writingHooks: Record<string, WritingHook> = {
  'spring-transactional': {
    question:
      'When one @Transactional method calls another and something fails, what rolls back?',
    answer:
      'It depends on propagation. REQUIRED shares one transaction and one fate, REQUIRES_NEW commits on its own, and NESTED rolls back to a savepoint.',
    Specimen: PropagationFate,
    prompt: 'Pick a propagation and who fails',
  },
  'logistic-regression': {
    question: 'Why not just fit a straight line to yes-or-no answers?',
    answer:
      'A line runs past 0 and 1. The sigmoid bends a score into a probability, and the threshold you choose decides where “yes” starts.',
    Specimen: ThresholdSlide,
    prompt: 'Drag the threshold',
  },
  'linear-regression': {
    question: 'Why does one bad data point drag the whole line?',
    answer:
      'Least squares squares every miss, so a point twice as far off pulls four times as hard.',
    Specimen: OutlierPull,
    prompt: 'Drag the hollow point',
  },
  'spring-bean-lifecycle': {
    question: 'Why isn’t the bean Spring hands you the object you wrote?',
    answer:
      'Spring builds it in stages, and after initialization a BeanPostProcessor can swap it for a proxy. That proxy is how @Transactional and @Async work.',
    Specimen: BeanStages,
    prompt: 'Step through creation',
  },
  'java-hashset-internals': {
    question: 'Why can’t my HashSet find an object I just added?',
    answer:
      'The set filed it under the hash it had when you added it. Change a field that feeds hashCode() and contains() looks in a different bucket.',
    Specimen: LostKey,
    prompt: 'Change the id',
  },
  'how-git-stores-code': {
    question:
      'How does GitHub store the same file once across many repositories?',
    answer:
      'Git names every object by a hash of its contents, so identical content always gets the same name and is stored once.',
    Specimen: ContentHash,
    prompt: 'Edit either file',
  },
};
