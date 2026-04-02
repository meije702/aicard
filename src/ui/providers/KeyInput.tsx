// KeyInput — API key input with provider documentation link.

import type { ProviderMeta } from '../../sous-chef/providers.ts'
import styles from '../SousChefProviders.module.css'

export default function KeyInput({
  provider,
  apiKey,
  onApiKeyChange,
  inputRef,
}: {
  provider: ProviderMeta
  apiKey: string
  onApiKeyChange: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <>
      <p className={styles.explanation}>
        {provider.keyHint.replace(/^Get your key at /, '')}{' '}
        <a href={provider.keyLink} target="_blank" rel="noopener noreferrer" className={styles.keyLink}>
          {provider.keyLink.replace('https://', '')}
        </a>
      </p>
      <label className={styles.inputLabel} htmlFor="provider-key">API key</label>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        id="provider-key"
        type="password"
        className={styles.keyInput}
        placeholder={provider.keyPlaceholder}
        value={apiKey}
        onChange={e => onApiKeyChange(e.target.value)}
        autoFocus
        autoComplete="off"
      />
      <p className={styles.securityNote}>
        Your key stays in this browser only — it is never sent to our servers.
      </p>
    </>
  )
}
