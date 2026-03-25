// MarkdownText: lightweight markdown → React elements renderer.
// Handles the subset of markdown the sous chef produces:
//   headings, bold, italic, ordered/unordered lists, paragraphs, hr.
// Builds React elements directly — no dangerouslySetInnerHTML, no deps.
//
// Block parsing lives in markdown-blocks.ts (pure, no React) so it can
// be tested without pulling in React's NODE_ENV check.

import type { ReactNode } from 'react'
import { parseBlocks } from './markdown-blocks.ts'

// Re-export for any consumers that imported from here
export { parseBlocks } from './markdown-blocks.ts'
export type { Block } from './markdown-blocks.ts'

interface Props {
  text: string
  className?: string
}

// Render inline formatting: **bold**, *italic*, `code`
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  // Match **bold**, *italic*, `code` — order matters (bold before italic)
  const pattern = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      // `code`
      parts.push(<code key={match.index}>{match[4]}</code>)
    } else if (match[5]) {
      // *italic*
      parts.push(<em key={match.index}>{match[6]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export default function MarkdownText({ text, className }: Props) {
  const blocks = parseBlocks(text)

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${Math.min(block.level + 2, 6)}` as 'h3' | 'h4' | 'h5' | 'h6'
            return <Tag key={i}>{renderInline(block.text)}</Tag>
          }
          case 'hr':
            return <hr key={i} />
          case 'ul':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            )
          case 'paragraph':
            return <p key={i}>{renderInline(block.text)}</p>
        }
      })}
    </div>
  )
}
