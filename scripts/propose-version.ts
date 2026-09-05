/* eslint-disable no-console */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { proposeVersion } from './release-version.ts'

type ChangeClassification = 'additive' | 'semantic change' | 'breaking'

interface PackageJsonVersion {
  version: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const changelogPath = join(repoRoot, 'CHANGELOG.md')
const packagePath = join(repoRoot, 'package.json')

const CLASSIFICATION_PREFIX = 'Contract change type:'
const ALLOWED: readonly ChangeClassification[] = ['additive', 'semantic change', 'breaking']

const changelog = readFileSync(changelogPath, 'utf8')
const unreleasedSection = changelog.split('## [Unreleased]')[1]?.split('\n## [')[0] ?? ''

const classificationPattern = new RegExp(
  `${CLASSIFICATION_PREFIX}\\s*(${ALLOWED.join('|')})`,
  'i'
)
const match = unreleasedSection.match(classificationPattern)

if (!match) {
  const hasContent = unreleasedSection.trim().length > 0
  if (!hasContent) {
    console.log('No unreleased changes. No version bump needed.')
    process.exit(0)
  }
  throw new Error(
    [
      'Unreleased section has content but is missing a contract change classification.',
      `Expected: ${CLASSIFICATION_PREFIX} <${ALLOWED.join(' | ')}>`,
      'Add a classification line to CHANGELOG.md [Unreleased] before proposing a version.'
    ].join('\n')
  )
}

const classification = match[1].toLowerCase() as ChangeClassification
const parsed = JSON.parse(readFileSync(packagePath, 'utf8')) as unknown

if (
  typeof parsed !== 'object' ||
  parsed === null ||
  !('version' in parsed) ||
  typeof (parsed as { version: unknown }).version !== 'string'
) {
  throw new Error('package.json is missing a valid string version field.')
}

const pkg = parsed as PackageJsonVersion
const current = pkg.version
const releaseImpact = unreleasedSection.match(/^Release impact:\s*(.+)$/im)?.[1].trim()
const { proposed, bumpType } = proposeVersion(current, classification, releaseImpact)

console.log(`Current version : ${current}`)
console.log(`Classification  : ${classification}`)
console.log(`Bump type       : ${bumpType}`)
console.log(`Proposed version: ${proposed}`)
