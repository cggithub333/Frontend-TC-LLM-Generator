---
description: Lint and format code
---

## Steps

1. Run linter:
```bash
npm run lint
```
// turbo

2. Fix auto-fixable issues:
```bash
npm run lint:fix
```

3. Format code:
```bash
npm run format
```

4. Type check (if TypeScript):
```bash
npm run typecheck
```

## Troubleshooting
- **Config not found**: Ensure `.eslintrc` and `prettier.config` exist
- **Conflicting rules**: Check ESLint/Prettier integration
- **TypeScript errors**: Run `npm run typecheck` separately
