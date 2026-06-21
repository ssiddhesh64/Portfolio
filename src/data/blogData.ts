export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}

// Dynamically glob-import all markdown files from the root 'blogs' folder
// { query: '?raw', import: 'default', eager: true } yields Record<filepath, rawTextContentString>
const rawModules = import.meta.glob('../../blogs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseMarkdown(filepath: string, rawContent: string): BlogPost {
  // Extract file ID from path (e.g. "../../blogs/some-post.md" -> "some-post")
  const id = filepath.split('/').pop()?.replace('.md', '') || 'unknown';

  let title = id.replace(/-/g, ' ');
  let date = new Date().toLocaleDateString();
  let readTime = "5 min read";
  let summary = "";
  let tags: string[] = [];
  let content = rawContent;

  if (rawContent.trim().startsWith('---')) {
    const parts = rawContent.split('---');
    if (parts.length >= 3) {
      const yaml = parts[1];
      content = parts.slice(2).join('---').trim();

      // Basic frontmatter parser
      yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim();
          let value = line.slice(colonIndex + 1).trim();
          
          // Strip enclosing quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }

          if (key === 'title') title = value;
          else if (key === 'date') date = value;
          else if (key === 'readTime') readTime = value;
          else if (key === 'summary') summary = value;
          else if (key === 'tags') {
            if (value.startsWith('[') && value.endsWith(']')) {
              tags = value.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, ''));
            } else {
              tags = [value];
            }
          }
        }
      });
    }
  }

  // Fallback summary if not specified in frontmatter
  if (!summary) {
    const cleanText = content
      .replace(/[#*`\-\[\]()]/g, '') // Strip markdown characters
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
