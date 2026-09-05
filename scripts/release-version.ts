export function proposeVersion(
  current: string,
  classification: 'additive' | 'semantic change' | 'breaking',
  releaseImpact?: string,
): { proposed: string; bumpType: 'major' | 'minor' | 'patch' } {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(current)) {
    throw new Error(`Invalid package.json version: ${current}`)
  }
  const [major, minor, patch] = current.split('.').map(Number)
  const bumpType = releaseImpact ?? (classification === 'breaking' ? 'major' : 'minor')
  if (bumpType !== 'major' && bumpType !== 'minor' && bumpType !== 'patch') {
    throw new Error('Release impact must be patch, minor, or major.')
  }
  if (classification === 'breaking' && bumpType !== 'major') {
    throw new Error('Breaking changes require a major release.')
  }
  if (classification === 'additive' && bumpType === 'patch') {
    throw new Error('Additive changes require a minor or major release.')
  }
  const proposed = bumpType === 'major' ? `${major + 1}.0.0`
    : bumpType === 'minor' ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`
  return { proposed, bumpType }
}
