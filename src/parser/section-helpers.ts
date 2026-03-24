// Shared section-extraction helpers for markdown parsers.
// Used by card-parser, equipment-parser, and any future .md format parsers.

// Extract the lines belonging to a named section (up to the next ## heading).
// Case-insensitive: "## equipment" and "## EQUIPMENT" both match "## Equipment".
export function extractSection(lines: string[], heading: string): string[] {
  const result: string[] = []
  let inSection = false

  for (const line of lines) {
    if (line.trim().toLowerCase() === heading.toLowerCase()) {
      inSection = true
      continue
    }
    if (inSection && /^##\s/.test(line) && line.trim().toLowerCase() !== heading.toLowerCase()) {
      break
    }
    if (inSection) result.push(line)
  }

  return result
}

// Extract ### subsections from a set of lines into a name→content map.
// Subsection names are normalised to lowercase.
export function extractSubsections(lines: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  let currentName = ''
  const contentLines: string[] = []

  function flush() {
    if (currentName) {
      result[currentName] = contentLines.join('\n').trim()
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^###\s+(.+)$/)
    if (headingMatch) {
      flush()
      currentName = headingMatch[1].trim().toLowerCase()
      contentLines.length = 0
    } else if (currentName) {
      contentLines.push(line)
    }
  }
  flush()

  return result
}
