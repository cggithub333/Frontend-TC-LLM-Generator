---
description: Run tests (unit, integration, E2E)
---

## Steps

1. Run all tests:
```bash
npm test
```
// turbo

2. Run tests in watch mode:
```bash
npm run test:watch
```

3. Run with coverage:
```bash
npm run test:coverage
```

4. Run E2E tests (if configured):
```bash
npm run test:e2e
```

## Troubleshooting
- **Snapshot failures**: Review changes, update with `npm test -- -u`
- **Timeout errors**: Increase timeout in test config
- **DOM errors**: Ensure testing-library is properly configured
