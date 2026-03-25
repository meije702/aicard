import { assertEquals } from 'jsr:@std/assert'
import { parseBlocks } from './markdown-blocks.ts'
import type { Block } from './markdown-blocks.ts'

// --- Headings ---

Deno.test('parseBlocks: parses # heading as level 1', () => {
  const blocks = parseBlocks('# Hello')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'heading')
  assertEquals((blocks[0] as Extract<Block, { type: 'heading' }>).level, 1)
  assertEquals((blocks[0] as Extract<Block, { type: 'heading' }>).text, 'Hello')
})

Deno.test('parseBlocks: parses ## through #### headings', () => {
  const blocks = parseBlocks('## Two\n### Three\n#### Four')
  assertEquals(blocks.length, 3)
  assertEquals((blocks[0] as Extract<Block, { type: 'heading' }>).level, 2)
  assertEquals((blocks[1] as Extract<Block, { type: 'heading' }>).level, 3)
  assertEquals((blocks[2] as Extract<Block, { type: 'heading' }>).level, 4)
})

// --- Horizontal rules ---

Deno.test('parseBlocks: parses --- as horizontal rule', () => {
  const blocks = parseBlocks('---')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'hr')
})

Deno.test('parseBlocks: parses longer dashes as horizontal rule', () => {
  const blocks = parseBlocks('-----')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'hr')
})

// --- Unordered lists ---

Deno.test('parseBlocks: parses dash list items', () => {
  const blocks = parseBlocks('- first\n- second\n- third')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'ul')
  const ul = blocks[0] as Extract<Block, { type: 'ul' }>
  assertEquals(ul.items, ['first', 'second', 'third'])
})

Deno.test('parseBlocks: parses asterisk list items', () => {
  const blocks = parseBlocks('* alpha\n* beta')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'ul')
})

// --- Ordered lists ---

Deno.test('parseBlocks: parses numbered list items', () => {
  const blocks = parseBlocks('1. first\n2. second\n3. third')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'ol')
  const ol = blocks[0] as Extract<Block, { type: 'ol' }>
  assertEquals(ol.items, ['first', 'second', 'third'])
})

// --- Paragraphs ---

Deno.test('parseBlocks: consecutive lines merge into one paragraph', () => {
  const blocks = parseBlocks('Hello world.\nThis is a test.')
  assertEquals(blocks.length, 1)
  assertEquals(blocks[0].type, 'paragraph')
  assertEquals((blocks[0] as Extract<Block, { type: 'paragraph' }>).text, 'Hello world. This is a test.')
})

Deno.test('parseBlocks: blank line separates two paragraphs', () => {
  const blocks = parseBlocks('First paragraph.\n\nSecond paragraph.')
  assertEquals(blocks.length, 2)
  assertEquals(blocks[0].type, 'paragraph')
  assertEquals(blocks[1].type, 'paragraph')
})

// --- Mixed content ---

Deno.test('parseBlocks: mixed heading, paragraph, list, and hr', () => {
  const md = `# Title

Some intro text.

- item one
- item two

---

Final note.`
  const blocks = parseBlocks(md)
  assertEquals(blocks.map(b => b.type), ['heading', 'paragraph', 'ul', 'hr', 'paragraph'])
})

// --- Inline formatting preserved in block text ---

Deno.test('parseBlocks: bold and italic stay in paragraph text', () => {
  const blocks = parseBlocks('This has **bold** and *italic* text.')
  assertEquals(blocks.length, 1)
  const text = (blocks[0] as Extract<Block, { type: 'paragraph' }>).text
  assertEquals(text.includes('**bold**'), true)
  assertEquals(text.includes('*italic*'), true)
})

// --- Edge cases ---

Deno.test('parseBlocks: empty input returns no blocks', () => {
  assertEquals(parseBlocks('').length, 0)
})

Deno.test('parseBlocks: only whitespace returns no blocks', () => {
  assertEquals(parseBlocks('   \n  \n   ').length, 0)
})

Deno.test('parseBlocks: heading without space after # is a paragraph', () => {
  const blocks = parseBlocks('#NoSpace')
  assertEquals(blocks[0].type, 'paragraph')
})
