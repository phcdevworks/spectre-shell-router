# Security Policy

## Supported Versions

We aim to support the latest published version of Spectre Shell Router. Security updates are applied to the current major version only.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

**Please ensure you are using the most recent version** and keep dependencies updated in `package.json`.

Older releases may not receive security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Security issues should be reported privately to protect users.

### How to Report

**Preferred method**: Use [GitHub Security Advisories](https://github.com/phcdevworks/spectre-shell-router/security/advisories/new) to privately report vulnerabilities

**Alternative methods**:

- Email the maintainers at [security contact - see repository]
- Direct message maintainers through GitHub

### What to Include

Please provide as much detail as possible to help us reproduce and assess impact:

1. **Description of the vulnerability** and potential impact
2. **Steps to reproduce** or proof-of-concept code
3. **Affected versions** (if known)
4. **Potential attack scenarios**
5. **Suggested mitigation** (if you have ideas)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt within **48 hours**
2. **Assessment**: We will investigate and provide an initial assessment within **5 business days**
3. **Updates**: We will keep you informed of the fix status throughout the process
4. **Resolution**: We will work on a fix and coordinate disclosure timing with you
5. **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Responsible Disclosure

We appreciate responsible disclosure and will work with you to:

- Understand the scope and severity of the issue
- Develop and test a fix
- Coordinate public disclosure timing
- Credit your contribution (if desired)

**Please allow us reasonable time to address the issue before public disclosure.**

## Security Best Practices

When using Spectre Shell Router:

1. **Keep dependencies updated** to the latest versions
2. **Monitor dependencies** for known vulnerabilities (`npm audit`)
3. **Validate and sanitize user input**
4. **Follow secure coding practices**
5. **Use security linters and tools**

## Scope

This security policy covers:

- The Spectre Shell Router source code
- Build configuration and compilation
- TypeScript source files
- Project dependencies

This policy does **NOT** cover:

- Issues in npm dependencies (report to their maintainers)
- Server or deployment configuration issues
- Third-party integrations

## Contact

For security-related questions that aren't vulnerabilities:

- Open a [GitHub Discussion](https://github.com/phcdevworks/spectre-shell-router/discussions)
- Tag maintainers in relevant issues

Thank you for helping keep this template and our community safe!
