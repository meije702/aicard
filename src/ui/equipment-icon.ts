// Map equipment names to friendly icons.
// Shared between Kitchen and RecipeView to avoid duplication.
export function equipmentIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('shopify') || n.includes('shop')) return '🛍'
  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) return '✉️'
  if (n.includes('discord')) return '💬'
  if (n.includes('slack')) return '💬'
  if (n.includes('calendar')) return '📅'
  if (n.includes('spreadsheet') || n.includes('sheets')) return '📊'
  return '🔌'
}
