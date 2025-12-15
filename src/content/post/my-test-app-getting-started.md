---
title: 'Getting Started with My Test App'
description: 'A sample post demonstrating how project-linked content works. This serves as a template for new projects.'
publishDate: '2025-12-15'
draft: false
featured: false
category: technical
tags: ['engineering', 'tutorial']
projectId: my-test-app
---

This is a sample post that demonstrates how posts link to projects via the `projectId` frontmatter field.

## How Project Linking Works

When you create a new project using `create-package.mjs`, the script automatically generates:

1. **Package directory** at `packages/my-test-app/`
2. **Hub page** at `src/pages/projects/my-test-app.astro`
3. **Project yaml** at `packages/shared/src/data/projects/my-test-app.yaml`
4. **Notebook folder** at `analytics/notebooks/my-test-app/`
5. **Sample post** (this file) linked via `projectId`

## Writing Related Content

To link any post to a project, add the `projectId` field to your frontmatter:

```yaml
---
title: 'Your Post Title'
projectId: my-test-app
---
```

The hub page automatically discovers and displays all posts with matching `projectId`.

## Next Steps

- Build your app in `packages/my-test-app/`
- Add notebooks to `analytics/notebooks/my-test-app/`
- Write more posts with `projectId: my-test-app` to build your project's documentation
