
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  // Helper to render inline formatting for bold, italic, and code
  const renderInline = (text: string): React.ReactNode => {
    // Split text by recognized markdown patterns, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).filter(Boolean);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-[var(--bg-contrast)] text-[var(--color-accent)] px-1 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Split content into blocks based on blank lines. This is more robust.
  const blocks = content.split(/\n\s*\n/).filter(block => block.trim());

  return (
    <div className="markdown-content text-sm leading-relaxed">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n');
        // A block is determined to be a list if all its non-empty lines start with a hyphen.
        const isList = lines.filter(l => l.trim() !== '').every(l => l.trim().startsWith('- '));

        if (isList) {
          // Filter out empty lines and map to list items
          const listItems = lines
            .map(l => l.trim())
            .filter(l => l.startsWith('- '))
            .map(l => l.substring(2).trim());

          return (
            <ul key={blockIndex} className="list-disc pl-5 space-y-1 my-2">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Otherwise, render the entire block as a paragraph
        return (
          <p key={blockIndex} className="my-2 whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
