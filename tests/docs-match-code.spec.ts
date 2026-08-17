/**
 * Documentation drift, caught mechanically: the README is the only
 * description of this plugin's contract, so read it here instead of hoping.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')

const read = (...parts: string[]): string => readFileSync(join(root, ...parts), 'utf8')

/** Config field names the schema declares, in source order. */
function schemaFields(source: string): string[] {
  const block = /export const Config: z<Config> = z\.object\(\{([\s\S]*?)\n\}\)/.exec(source)
  if (block === null) return []
  return [...(block[1] as string).matchAll(/^\s{2}(\w+):/gm)].map(match => match[1] as string)
}

describe('cli-session', () => {
  const readme = read('README.md')
  const index = read('src', 'index.ts')

  it('documents every config field', () => {
    const fields = schemaFields(index).filter(field => field !== 'request')
    expect(fields).toContain('sessionTag')
    const undocumented = fields.filter(field => !readme.includes(`\`${field}\``))
    expect(undocumented).toEqual([])
  })

  it('documents every flag the startup declares', () => {
    const startup = read('src', 'startup.ts')
    // Long-form-only flags count too: `--json-schema` has no short form and a
    // short-plus-long pattern would have let it go undocumented.
    const flags = [...startup.matchAll(/\.option\('(?:-\w, )?--([a-z-]+)/g)].map(match => `--${match[1] as string}`)
    expect(flags.length).toBeGreaterThan(5)
    const undocumented = flags.filter(flag => !readme.includes(flag))
    expect(undocumented).toEqual([])
  })
})
