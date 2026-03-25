import { assertEquals } from 'jsr:@std/assert'
import { normaliseCardType } from './card-type.ts'

Deno.test('normaliseCardType: Send Message → send-message', () => {
  assertEquals(normaliseCardType('Send Message'), 'send-message')
})

Deno.test('normaliseCardType: LISTEN → listen', () => {
  assertEquals(normaliseCardType('LISTEN'), 'listen')
})

Deno.test('normaliseCardType: unknown-card → null', () => {
  assertEquals(normaliseCardType('unknown-card'), null)
})

Deno.test('normaliseCardType: empty string → null', () => {
  assertEquals(normaliseCardType(''), null)
})
