# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in AICard, please report it responsibly. **Do not open a public issue.**

Email: **[TODO: add security contact email]**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

## Response timeline

- **Acknowledgment**: within 48 hours
- **Assessment**: within 1 week
- **Fix or mitigation**: as soon as practical, depending on severity

## Scope

Security concerns relevant to AICard include:

- **API key exposure**: equipment connections store API keys (Anthropic API, etc.). These must never be logged, transmitted unexpectedly, or exposed in the UI.
- **localStorage security**: kitchen state is stored in browser localStorage. Sensitive data must be handled appropriately.
- **Recipe injection**: recipe and card files are parsed from Markdown. Parsers must not execute arbitrary code.
- **Dependency vulnerabilities**: third-party packages used by the project.

## What is not in scope

- Vulnerabilities in upstream services (Shopify, email providers, etc.) connected as equipment
- Issues requiring physical access to the user's machine
- Social engineering attacks

## Disclosure

We follow coordinated disclosure. We will work with you to understand the issue and coordinate a fix before any public disclosure.
