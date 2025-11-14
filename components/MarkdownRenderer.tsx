import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const lines = content.split('\n');
    // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: (React.ReactElement | null)[] = [];
    let inList = false;

    // Helper to render inline formatting
    const renderInline = (text: string) => {
        // Split by all supported markdown syntax using a regex with capturing groups
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

    lines.forEach((line, index) => {
        if (line.trim().startsWith('- ')) {
            const listContent = line.trim().substring(2);
            if (!inList) {
                inList = true;
                // Start a new list
                elements.push(
                    <ul key={`ul-${index}`} className="list-disc pl-5 space-y-1 my-2">
                        <li key={index}>{renderInline(listContent)}</li>
                    </ul>
                );
            } else {
                // Add to the existing list
                const lastElement = elements[elements.length - 1];
                if(lastElement && lastElement.type === 'ul') {
                    // Fix: Correctly handle adding children to an existing list element.
                    // The previous implementation would fail if `props.children` was a single element and not an array.
                    const existingChildren = React.Children.toArray(lastElement.props.children);
                    const newProps = {...lastElement.props, children: [...existingChildren, <li key={index}>{renderInline(listContent)}</li>]};
                    elements[elements.length - 1] = React.cloneElement(lastElement, newProps);
                }
            }
        } else {
            inList = false;
            // Treat empty lines as paragraph breaks
            if (line.trim() === '') {
                 elements.push(null);
            } else {
                elements.push(<p key={index} className="my-2">{renderInline(line)}</p>);
            }
        }
    });

    return (
        <div className="markdown-content text-sm leading-relaxed">
            {elements.filter(Boolean)}
        </div>
    );
};

export default MarkdownRenderer;