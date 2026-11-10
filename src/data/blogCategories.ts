/**
 * Article categories. Each category is a folder in content/blogs/, and every
 * article lives inside one:
 *
 *   content/blogs/<category>/<slug>/index.mdx
 *
 * To add a category, create the folder and add an entry here with the same
 * id. The build fails if a folder has no entry, so a typo cannot silently
 * create an unlisted category. Categories appear in the order listed.
 */
export interface BlogCategory {
  /** Folder name and URL segment: /blog/category/<id>. Never rename once published. */
  id: string;
  title: string;
  /** One or two sentences, shown on the category page and as its meta description. */
  description: string;
}

export const blogCategories: readonly BlogCategory[] = [
  {
    id: 'distributed-systems',
    title: 'Distributed Systems',
    description:
      'How large systems store, replicate and serve data, traced from the data model down to the storage layer.',
  },
  {
    id: 'spring',
    title: 'Spring',
    description:
      'What Spring and Spring Boot do between your annotations and a running application: bean lifecycle, proxies and transactions.',
  },
  {
    id: 'java',
    title: 'Java',
    description:
      'The language and standard library underneath: collections, hashing and the contracts they rely on.',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    description:
      'Classic models built from first principles, with the maths derived and the code run on real data.',
  },
];
