# Track A – SST/CDK Platform

High-level:
- Infra as Code with SST (on CDK).
- Next.js app on AWS (Lambda@Edge/CloudFront) or Vercel + AWS backends.
- Secrets: AWS Secrets Manager.
- CI/CD: GitHub Actions.

Steps:
1. Bootstrap CDK account/region.
2. Provision: VPC (optional), CloudFront, S3 (assets), API Gateway + Lambda for custom APIs.
3. Configure Secrets Manager (EOS_API_KEY, ACCUWEATHER_API_KEY, SENTINEL creds).
4. Build pipeline with artifacts, env promotion (dev → prod).
5. DNS via Route53; ACM certs.

Rollback strategy:
- Blue/green for CloudFront origins.
- Lambda versions/aliases.

Monitoring:
- CloudWatch dashboards & alarms, Synthetics canaries.
