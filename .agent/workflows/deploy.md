---
description: Deploy to production/staging
---

## Prerequisites
- Production build completed (`/build`)
- Deployment credentials configured

## Steps

1. Build first:
```bash
npm run build
```

2. Deploy based on platform:

**Vercel**
```bash
vercel --prod
```

**Netlify**
```bash
netlify deploy --prod
```

**AWS S3 + CloudFront**
```bash
aws s3 sync dist/ s3://bucket-name --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

**Docker**
```bash
docker build -t app:latest .
docker push registry/app:latest
```

## Troubleshooting
- **Build failed**: Run `/build` first
- **Auth failed**: Refresh platform credentials
- **Cache issues**: Invalidate CDN cache
