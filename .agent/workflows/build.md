---
description: Create production build
---

## Steps

1. Build for production:
```bash
npm run build
```
// turbo

2. Preview production build (optional):
```bash
npm run preview
```

## Troubleshooting
- **Build failed**: Check for TypeScript/ESLint errors
- **Memory issues**: Increase Node memory `NODE_OPTIONS=--max_old_space_size=4096`
- **Missing env vars**: Ensure `.env.production` exists
