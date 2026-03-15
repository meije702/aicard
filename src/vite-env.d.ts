/// <reference types="vite/client" />

// CSS Modules type declarations — Vite handles the imports at runtime,
// but TypeScript needs to know the shape of the import.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
