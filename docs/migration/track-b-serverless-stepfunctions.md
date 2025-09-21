# Track B – Serverless + Step Functions

High-level:
- Next.js hosted on Vercel or CloudFront.
- Backend: API Gateway + Lambda, orchestrations via Step Functions.
- Integrations: SQS/SNS/EventBridge for async jobs (e.g., imagery polling).

Steps:
1. Create API Gateway (HTTP) with Lambda routes for `/api/*`.
2. Create Step Functions state machines for imagery → stats → cache.
3. Grant IAM to read secrets from Secrets Manager.
4. Add CI workflow to deploy Lambdas/State Machines via AWS SAM or Serverless Framework.
5. Wire web to call server routes only (no client secrets).

Monitoring:
- X-Ray traces; CloudWatch metrics/alarms.
