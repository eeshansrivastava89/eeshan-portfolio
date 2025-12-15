# My Test App

## Development

```bash
# Install dependencies (from root)
pnpm install

# Dev server
pnpm --filter @eeshans/my-test-app dev

# Build
pnpm --filter @eeshans/my-test-app build
```

## URL

- Development: `http://localhost:4321/my-test-app/`
- Production: `https://eeshans.com/my-test-app/`

## Structure

- `src/pages/index.astro` - Main page using shared AppLayout
- `src/components/` - React/Astro components
- `public/` - Static assets
