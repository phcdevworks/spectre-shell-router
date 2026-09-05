import { describe, expect, it } from 'vitest'
import { proposeVersion } from '../scripts/release-version'

describe('release version proposals', () => {
  it('allows explicit patch releases for bug fixes', () => {
    expect(proposeVersion('1.4.1', 'semantic change', 'patch')).toEqual({
      proposed: '1.4.2', bumpType: 'patch',
    })
  })
  it.each(['additive', 'semantic change'] as const)('preserves the minor default for %s', (kind) => {
    expect(proposeVersion('1.4.1', kind).proposed).toBe('1.5.0')
  })
  it('defaults breaking changes to major', () => {
    expect(proposeVersion('1.4.1', 'breaking').proposed).toBe('2.0.0')
  })
  it('rejects undersized releases and invalid impact values', () => {
    expect(() => proposeVersion('1.4.1', 'breaking', 'minor')).toThrow()
    expect(() => proposeVersion('1.4.1', 'additive', 'patch')).toThrow()
    expect(() => proposeVersion('1.4.1', 'semantic change', 'typo')).toThrow()
  })
  it.each(['1.4', '1.4.1oops', '01.4.1'])('rejects invalid version %s', (version) => {
    expect(() => proposeVersion(version, 'semantic change', 'patch')).toThrow()
  })
})
