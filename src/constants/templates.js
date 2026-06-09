export const LAYOUT_TEMPLATES = [
  {
    id: 'starter',
    label: 'Starter',
    content: `:::row
:::col width=100
# Welcome
Describe your layout here.
:::
:::`,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    content: `:::row
:::col width=30
# Sidebar
:::info
Navigation
:::
Projects
Reports
Settings
:::
:::col width=70
# Main Content
Overview for your current workspace.
:::info
Status: Healthy
:::
Recent activity appears here.
:::
:::`,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    content: `# Documentation Page

:::row
:::col width=35
## Navigation
Getting Started
Components
Examples
:::
:::col width=65
## Overview
Use this template to sketch a documentation-style layout.
:::info
Tip: keep content blocks concise for clearer previews.
:::
:::
:::`,
  },
];
