import { describe, expect, it } from 'vitest'
import { proposeVersion } from '../scripts/release-version'

describe('release version proposals', () => {
  it('allows explicit patch releases for bug fixes', () => {
    expect(proposeVersion('2.3.4', 'semantic change', 'patch')).toEqual({
      proposed: '2.3.5', bumpType: 'patch',
    })
  })
  it.each(['additive', 'semantic change'] as const)('preserves the minor default for %s', (kind) => {
    expect(proposeVersion('2.3.4', kind).proposed).toBe('2.4.0')
  })
  it('defaults breaking changes to major', () => {
    expect(proposeVersion('2.3.4', 'breaking').proposed).toBe('3.0.0')
  })
  it('rejects undersized releases and invalid impact values', () => {
    expect(() => proposeVersion('2.3.4', 'breaking', 'minor')).toThrow()
    expect(() => proposeVersion('2.3.4', 'additive', 'patch')).toThrow()
    expect(() => proposeVersion('2.3.4', 'semantic change', 'typo')).toThrow()
  })
  it.each(['2.3', '2.3.4oops', '02.3.4'])('rejects invalid version %s', (version) => {
    expect(() => proposeVersion(version, 'semantic change', 'patch')).toThrow()
  })
})
