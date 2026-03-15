// Load fixture files for tests.
// Resolves paths relative to src/fixtures/ using import.meta.url.

const FIXTURES_DIR = new URL('../../fixtures/', import.meta.url)

export async function loadFixture(relativePath: string): Promise<string> {
  const url = new URL(relativePath, FIXTURES_DIR)
  return await Deno.readTextFile(url)
}
