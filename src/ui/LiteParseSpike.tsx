// LiteParse spike — minimal UI to test photo-to-recipe transcription.
// Not wired into the main navigation; accessed via the kitchen screen.

import { useRef, useState } from 'react'
import type { SousChefConfig, ParsedRecipe } from '../types.ts'
import { liteparse, readImageFile } from '../liteparse/liteparse.ts'
import styles from './LiteParseSpike.module.css'

interface Props {
  sousChefConfig: SousChefConfig | null
  onRecipeParsed: (markdown: string, parsed: ParsedRecipe) => void
  onBack: () => void
}

export default function LiteParseSpike({ sousChefConfig, onRecipeParsed, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [rawMarkdown, setRawMarkdown] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(file: File | undefined) {
    if (!file) return
    setImageFile(file)
    setRawMarkdown(null)
    setParsed(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleTranscribe() {
    if (!imageFile || !sousChefConfig) return
    setLoading(true)
    setError(null)

    try {
      const { base64, mediaType } = await readImageFile(imageFile)
      const result = await liteparse(sousChefConfig, base64, mediaType)
      setRawMarkdown(result.rawMarkdown)
      setParsed(result.parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleUseRecipe() {
    if (rawMarkdown && parsed) {
      onRecipeParsed(rawMarkdown, parsed)
    }
  }

  function handleReset() {
    setImageDataUrl(null)
    setImageFile(null)
    setRawMarkdown(null)
    setParsed(null)
    setError(null)
  }

  const canTranscribe = imageFile && sousChefConfig && !loading

  return (
    <div className={styles.container}>
      <button className={styles.secondaryButton} onClick={onBack} style={{ marginBottom: 16, flex: 'none', width: 'auto' }}>
        Back to kitchen
      </button>

      <h2 className={styles.heading}>LiteParse</h2>
      <p className={styles.subtitle}>
        Take a photo of a handwritten AICard recipe and transcribe it.
      </p>

      {!sousChefConfig && (
        <div className={styles.errorMessage}>
          Connect a sous chef provider first (Settings) to use LiteParse.
        </div>
      )}

      {/* Drop zone / file input */}
      <div
        className={styles.dropZone}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click() }}
      >
        {imageDataUrl ? (
          <img src={imageDataUrl} alt="Recipe photo preview" className={styles.preview} />
        ) : (
          <p className={styles.hint}>Tap to take a photo or choose an image</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      <button
        className={styles.transcribeButton}
        disabled={!canTranscribe}
        onClick={handleTranscribe}
      >
        {loading ? 'Transcribing...' : 'Transcribe'}
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Result section */}
      {rawMarkdown && parsed && (
        <div className={styles.resultSection}>
          <p className={styles.resultLabel}>Transcribed recipe</p>
          <div className={styles.markdownOutput}>{rawMarkdown}</div>

          {!parsed.success && (
            <>
              <p className={styles.resultLabel} style={{ marginTop: 16 }}>Parse warnings</p>
              <ul className={styles.errorList}>
                {parsed.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </>
          )}

          <div className={styles.actions}>
            <button className={styles.secondaryButton} onClick={handleReset}>Try another</button>
            {parsed.success && (
              <button className={styles.transcribeButton} style={{ flex: 1, marginTop: 0 }} onClick={handleUseRecipe}>
                Use this recipe
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
