# Security policy

## Supported versions

OddlyAlive is currently an alpha. Security fixes are applied to the newest
`0.2.x` prerelease only.

| Version | Supported |
| --- | --- |
| `0.2.x` alpha | Yes |
| Earlier versions | No |

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include reproduction steps, affected versions, impact, and any suggested
   mitigation.

Do not open a public issue for an unpatched vulnerability. Maintainers will
acknowledge a report as soon as practical and coordinate disclosure after a
fix is available.

OddlyAlive executes local scene recipes and serves a local development site.
Reports involving path traversal, unintended network access, malicious scene
input, generated-project integrity, or package-install behavior are especially
useful.
