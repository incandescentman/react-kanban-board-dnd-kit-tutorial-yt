// Utility functions for parsing and handling tags
import React from "react";

export function extractTags(text: string): string[] {
  // Match #word but not # followed by space (which is heading syntax)
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(tagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

export function getTagColor(tag: string): { bg: string; text: string; border: string } {
  // Generate consistent color based on tag name
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  ];

  // Simple hash function to get consistent color for each tag
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

export function renderContentWithTags(
  content: string, 
  onTagClick: (tag: string) => void
): { content: React.ReactNode; tags: React.ReactNode[] } {
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const tags: React.ReactNode[] = [];
  let cleanContent = content;
  let match;

  // Extract all tags
  const matches: Array<{ tag: string; index: number; length: number }> = [];
  while ((match = tagRegex.exec(content)) !== null) {
    matches.push({
      tag: match[0].toLowerCase(),
      index: match.index,
      length: match[0].length
    });
  }

  // Remove tags from content (working backwards to maintain indices)
  matches.reverse().forEach(({ index, length }) => {
    cleanContent = cleanContent.slice(0, index) + cleanContent.slice(index + length);
  });

  // Create tag elements
  matches.forEach(({ tag }, i) => {
    const colors = getTagColor(tag);
    
    tags.push(
      <span
        key={`${tag}-${i}`}
        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity mr-1 ${colors.bg} ${colors.text} ${colors.border} border`}
        onClick={(e) => {
          e.stopPropagation();
          onTagClick(tag);
        }}
      >
        {tag}
      </span>
    );
  });

  return {
    content: cleanContent.trim(),
    tags
  };
}