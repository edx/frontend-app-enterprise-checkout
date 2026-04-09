Developing with AI
==================

This repository supports Claude Code out of the box via a top-level ``CLAUDE.md`` file and
team plugins from our shared marketplace.

Getting Started
---------------

For complete setup instructions, security best practices, and workflow guidance, see the
`Getting Started with Claude Code <https://github.com/edx/ai-devtools-internal/blob/main/docs/getting-started.md>`_
guide in our team's ai-devtools-internal repository.

Quick Reference
---------------

Key Files
~~~~~~~~~

- ``CLAUDE.md`` - Project context and instructions for Claude
- ``.claude/settings.json`` - Plugin and permission configuration
- ``.claude/settings.local.json`` - Personal overrides (gitignored)

Enabled Plugins
~~~~~~~~~~~~~~~

This repo uses the ``edx-enterprise-frontend-plugin`` which provides:

- ``/paragon`` skill for Paragon design system guidance

Security Reminder
-----------------

Always ensure you have `gitleaks <https://github.com/gitleaks/gitleaks>`_ installed with a
pre-commit hook to prevent accidental credential commits. See the
`Getting Started guide <https://github.com/edx/ai-devtools-internal/blob/main/docs/getting-started.md#security-best-practices>`_
for setup instructions.
