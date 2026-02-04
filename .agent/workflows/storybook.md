---
description: Run Storybook for component documentation
---

## Steps

1. Start Storybook:
```bash
npm run storybook
```
// turbo

2. Build static Storybook:
```bash
npm run build-storybook
```

## Troubleshooting
- **Port conflict**: Use `--port 6007` flag
- **Stories not loading**: Check story file naming (`*.stories.tsx`)
- **Addon errors**: Clear Storybook cache `rm -rf node_modules/.cache/storybook`
