export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}

// Dynamically glob-import all markdown files from the 'content/blogs' folder
// { query: '?raw', import: 'default', eager: true } yields Record<filepath, rawTextContentString>
const rawModules = import.meta.glob('../content/blogs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseMarkdown(filepath: string, rawContent: string): BlogPost {
  // Extract file ID from path (e.g. "../../blogs/some-post.md" -> "some-post")
  const id = filepath.split('/').pop()?.replace('.md', '') || 'unknown';

  let title = id.replace(/-/g, ' ');
  let date = new Date().toLocaleDateString();
  let readTime = '5 min read';
  let summary = '';
  let tags: string[] = [];
  let content = rawContent;

  if (rawContent.trim().startsWith('---')) {
    const parts = rawContent.split('---');
    if (parts.length >= 3) {
      const yaml = parts[1];
      content = parts.slice(2).join('---').trim();

      // Robust state-machine frontmatter parser supporting multi-line fields (e.g. formatted arrays/tags)
      let currentKey: string | null = null;
      let currentValueAccumulator: string[] = [];

      const saveCurrentField = () => {
        if (!currentKey) return;
        const joinedValue = currentValueAccumulator.join('\n').trim();

        let cleanValue = joinedValue;
        if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
          cleanValue = cleanValue.slice(1, -1);
        } else if (cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
          cleanValue = cleanValue.slice(1, -1);
        }

        if (currentKey === 'title') title = cleanValue;
        else if (currentKey === 'date') date = cleanValue;
        else if (currentKey === 'readTime') readTime = cleanValue;
        else if (currentKey === 'summary') summary = cleanValue;
        else if (currentKey === 'tags') {
          if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
            tags = cleanValue
              .slice(1, -1)
              .split(',')
              .map((t) => t.trim().replace(/['"]/g, ''))
              .filter((t) => t.length > 0);
          } else if (cleanValue.includes('- ')) {
            tags = cleanValue
              .split('\n')
              .map((line) =>
                line
                  .replace(/^\s*-\s*/, '')
                  .trim()
                  .replace(/['"]/g, ''),
              )
              .filter((t) => t.length > 0);
          } else {
            tags = [cleanValue].filter((t) => t.length > 0);
          }
        }
      };

      yaml.split('\n').forEach((line) => {
        const colonIndex = line.indexOf(':');
        const isNewKey =
          colonIndex !== -1 &&
          !line.startsWith(' ') &&
          !line.startsWith('\t') &&
          !line.startsWith('- ');

        if (isNewKey) {
          saveCurrentField();
          currentKey = line.slice(0, colonIndex).trim();
          currentValueAccumulator = [line.slice(colonIndex + 1).trim()];
        } else {
          if (currentKey) {
            currentValueAccumulator.push(line);
          }
        }
      });
      saveCurrentField();
    }
  }

  // Fallback summary if not specified in frontmatter
  if (!summary) {
    const cleanText = content
      .replace(/[#*`\-[\]()]/g, '') // Strip markdown characters
      .replace(/\s+/g, ' ')
      .trim();
    summary = cleanText.slice(0, 160) + '...';
  }

  return { id, title, summary, content, date, readTime, tags };
}

// Convert all imported markdown files to BlogPost items and sort them by date descending (approximate)
export const blogPosts: BlogPost[] = Object.entries(rawModules)
  .map(([path, content]) => parseMarkdown(path, content))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
