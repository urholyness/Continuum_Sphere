# Auth & Access Control

Protected routes
- `/trace`, `/ff-fund`: require BUYER/INVESTOR/ADMIN
- `/admin`: requires ADMIN

Login API: `POST /api/login`
- Test user: username `zakayo`, password `amanamnagani` (BUYER/INVESTOR)
- Admin: username `admin`, password = `ADMIN_PASS` (env)
- Invite-code fallback: `INVITE_CODE_BUYERS`, `INVITE_CODE_INVESTORS`

Environment variables (Vercel → Project → Settings → Environment Variables)
- `AUTH_SECRET`: JWT signing secret (random 32+ chars)
- `ADMIN_PASS`: admin password
- Optional invites: `INVITE_CODE_BUYERS`, `INVITE_CODE_INVESTORS`

Admin APIs
- `GET /api/admin/farms` → returns farms from DynamoDB if configured, else fallback list
- `POST /api/admin/farms` → upsert farm (requires `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optional `FARMS_TABLE`)

Migration note
- Web (Vercel) avoids bundling AWS SDK; serverless infra (Track A) will provision DynamoDB, IAM, and Secrets via SST/CDK in a separate repo.
