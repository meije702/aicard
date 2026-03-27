// LiteParse — transcribe a photo of a handwritten AICard recipe into .recipe.md.
//
// Sends the image to the sous chef (Claude Haiku vision) with a structured prompt,
// then validates the output through the existing recipe parser.

import type { SousChefConfig, ParsedRecipe } from '../types.ts'
import type { VisionImage } from '../sous-chef/client.ts'
import { sousChefAsk } from '../sous-chef/client.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { LITEPARSE_SYSTEM_PROMPT } from './liteparse-prompt.ts'

export interface LiteparseResult {
  parsed: ParsedRecipe
  rawMarkdown: string
}

// Convert a photo of a handwritten recipe into a validated ParsedRecipe.
export async function liteparse(
  config: SousChefConfig,
  base64: string,
  mediaType: VisionImage['mediaType'],
): Promise<LiteparseResult> {
  const image: VisionImage = { base64, mediaType }

  const rawMarkdown = await sousChefAsk(
    config,
    LITEPARSE_SYSTEM_PROMPT,
    'Transcribe the handwritten AICard recipe in this photo into valid .recipe.md markdown.',
    image,
  )

  const parsed = parseRecipe(rawMarkdown)

  return { parsed, rawMarkdown }
}

// Read a File (from an <input type="file">) into a base64 string and media type.
export function readImageFile(file: File): Promise<{ base64: string; mediaType: VisionImage['mediaType'] }> {
  return new Promise((resolve, reject) => {
    const validTypes: VisionImage['mediaType'][] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type as VisionImage['mediaType'])) {
      reject(new Error(`Unsupported image type: ${file.type}. Use JPEG, PNG, GIF, or WebP.`))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Strip the data:image/...;base64, prefix
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mediaType: file.type as VisionImage['mediaType'] })
    }
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}
