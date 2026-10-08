##############################################
Connecting AI Development Tools to Jira via MCP
##############################################

`Model Context Protocol (MCP) <https://modelcontextprotocol.io/>`_ is an open standard
that lets AI assistants communicate with external tools and services such as Jira. This
guide explains how to connect several popular AI tools to a Jira MCP server so that you
can query and manage Jira issues directly from your editor or terminal.

.. contents::
   :local:
   :depth: 2

Prerequisites
=============

Before configuring any AI tool, make sure you have the following:

* A **Jira API token** — generate one from your
  `Atlassian account settings <https://id.atlassian.com/manage-profile/security/api-tokens>`_.
* Your **Jira instance URL** (e.g., ``https://your-domain.atlassian.net``).
* The **email address** associated with your Atlassian account.
* ``Node.js`` and ``npx`` installed locally (required to run npm-based MCP servers).

GitHub Copilot
==============

VS Code
-------

1. Open **Copilot Chat** and switch to **Agent mode**.
2. Click the **tools icon** at the bottom of the chat panel and choose
   **Add MCP Tools**.
3. VS Code will open (or create) a ``mcp.json`` file. Add the Jira server block:

   .. code-block:: json

      {
        "servers": {
          "jira": {
            "command": "npx",
            "args": ["-y", "jira-mcp-server"],
            "env": {
              "JIRA_BASE_URL": "https://your-domain.atlassian.net",
              "JIRA_API_TOKEN": "YOUR_JIRA_API_TOKEN",
              "JIRA_EMAIL": "your-email@example.com"
            }
          }
        }
      }

4. Save the file. VS Code will prompt you to confirm running the new server —
   accept the dialog to complete the connection.
5. The Jira tools will now appear in the Copilot Chat tools panel.

.. note::

   If you are on a **Copilot Business or Enterprise** plan your organization
   administrator must enable the *"MCP servers in Copilot"* policy before
   custom MCP servers are available.

JetBrains IDEs
--------------

1. Open **Copilot Chat** and switch to **Agent mode**.
2. Click the **MCP icon** in the chat panel.
3. To add the server manually, click **Add MCP Tools** and edit the ``mcp.json``
   file using the same JSON structure shown in the VS Code section above.
4. Alternatively, browse the **MCP Registry** inside the dialog and install
   a Jira server directly from there if one is listed.
5. Restart the IDE to activate the new server.

GitHub.com (Copilot Chat on the web)
-------------------------------------

Copilot Chat on `github.com/copilot <https://github.com/copilot>`_ currently
supports only the built-in GitHub MCP server. **Custom MCP servers, including
Jira, cannot be added via the web interface.** Use one of the IDE integrations
above instead.

Claude
======

Claude Desktop
--------------

1. Open (or create) the Claude Desktop configuration file:

   * **macOS**: ``~/Library/Application Support/Claude/claude_desktop_config.json``
   * **Windows**: ``%APPDATA%\Claude\claude_desktop_config.json``

2. Add the Jira MCP server to the ``mcpServers`` object:

   .. code-block:: json

      {
        "mcpServers": {
          "jira": {
            "command": "npx",
            "args": ["-y", "jira-mcp-server"],
            "env": {
              "JIRA_BASE_URL": "https://your-domain.atlassian.net",
              "JIRA_API_TOKEN": "YOUR_JIRA_API_TOKEN",
              "JIRA_EMAIL": "your-email@example.com"
            }
          }
        }
      }

3. Save the file and **restart Claude Desktop**. It will automatically connect
   to the Jira MCP server on startup.

Claude CLI (command line)
--------------------------

If you are using the `Claude CLI <https://docs.anthropic.com/en/docs/claude-cli>`_
(``claude`` command), register the Jira MCP server with a single command:

.. code-block:: bash

   claude mcp add jira npx -- -y jira-mcp-server

Then export the required environment variables before starting a session:

.. code-block:: bash

   export JIRA_BASE_URL="https://your-domain.atlassian.net"
   export JIRA_API_TOKEN="YOUR_JIRA_API_TOKEN"
   export JIRA_EMAIL="your-email@example.com"
   claude

The Jira tools will be available inside the interactive Claude CLI session.

Comparison
==========

+-------------------------------+---------------------+--------------------+
| Tool                          | Custom MCP support  | Config file        |
+===============================+=====================+====================+
| GitHub Copilot (VS Code)      | ✅ Yes              | ``mcp.json``       |
+-------------------------------+---------------------+--------------------+
| GitHub Copilot (JetBrains)    | ✅ Yes              | ``mcp.json``       |
+-------------------------------+---------------------+--------------------+
| GitHub Copilot (github.com)   | ❌ No               | N/A                |
+-------------------------------+---------------------+--------------------+
| Claude Desktop                | ✅ Yes              | ``claude_desktop_config.json`` |
+-------------------------------+---------------------+--------------------+
| Claude CLI                    | ✅ Yes              | CLI / env vars     |
+-------------------------------+---------------------+--------------------+

Further Reading
===============

* `Extending GitHub Copilot Chat with MCP servers <https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/extend-copilot-chat-with-mcp>`_
* `Using the GitHub MCP Server <https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/use-the-github-mcp-server>`_
* `Model Context Protocol documentation <https://modelcontextprotocol.io/>`_
* `Atlassian API token management <https://id.atlassian.com/manage-profile/security/api-tokens>`_
