# Deployment Checklists

## Common
- [ ] Route53 domains prepared, ACM certs issued
- [ ] Secrets Manager entries created (EOS, AccuWeather, Sentinel)
- [ ] GitHub Actions secrets configured (AWS creds, OIDC, region)
- [ ] .env for local dev updated

## Track A – SST/CDK
- [ ] CDK bootstrap complete
- [ ] CloudFront/S3/API GW/Lambda stacks deployed
- [ ] DNS cutover and CloudFront invalidation
- [ ] CloudWatch alarms active

## Track B – Serverless + Step Functions
- [ ] API Gateway routes deployed
- [ ] Lambdas & Step Functions deployed
- [ ] Event rules (EventBridge/SQS/SNS) configured
- [ ] Alarms and X-Ray tracing enabled
