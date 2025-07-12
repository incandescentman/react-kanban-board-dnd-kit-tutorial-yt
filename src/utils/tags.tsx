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
): React.ReactNode[] {
  const tagRegex = /#([a-zA-Z0-9_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the tag as a clickable element
    const tag = match[0].toLowerCase();
    const colors = getTagColor(tag);
    
    parts.push(
      <span
        key={`${tag}-${match.index}`}
        className={`inline-block px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity mr-1 ${colors.bg} ${colors.text} ${colors.border} border`}
        onClick={(e) => {
          e.stopPropagation();
          onTagClick(tag);
        }}
      >
        {tag}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
}