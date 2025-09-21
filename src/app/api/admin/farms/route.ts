import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySession } from "@/lib/auth";

// Optional DynamoDB client (only used if env creds are present)
async function getDb() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) return null;
  const { DynamoDBClient, ScanCommand, PutItemCommand } = await import("@aws-sdk/client-dynamodb");
  const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });
  return { client, ScanCommand, PutItemCommand } as const;
}

function ensureAdmin() {
  const token = cookies().get(COOKIE)?.value;
  const session = verifySession(token);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = ensureAdmin();
  if (unauth) return unauth;

  const db = await getDb();
  if (!db) {
    // Fallback response when DB not configured
    return NextResponse.json({
      source: "fallback",
      items: [
        { id: "2BH", name: "2 Butterflies Homestead", lat: 0.5143, lng: 35.2698 },
        { id: "NOAH", name: "Noah's Joy", lat: -1.17, lng: 36.83 },
      ],
      note: "DynamoDB not configured; set AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY to enable persistence."
    });
  }
  const { client, ScanCommand } = db;
  const out = await client.send(new ScanCommand({ TableName: process.env.FARMS_TABLE || "gsg_farms" }));
  const items = (out.Items || []).map((it) => ({
    id: it.id?.S,
    name: it.name?.S,
    lat: it.lat?.N ? Number(it.lat.N) : undefined,
    lng: it.lng?.N ? Number(it.lng.N) : undefined,
  }));
  return NextResponse.json({ source: "dynamodb", items });
}

export async function POST(req: Request) {
  const unauth = ensureAdmin();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body?.id || !body?.name) {
    return NextResponse.json({ message: "id and name are required" }, { status: 400 });
  }
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ ok: false, message: "DB not configured" }, { status: 501 });
  }
  const { client, PutItemCommand } = db;
  await client.send(new PutItemCommand({
    TableName: process.env.FARMS_TABLE || "gsg_farms",
    Item: {
      id: { S: String(body.id) },
      name: { S: String(body.name) },
      lat: body.lat !== undefined ? { N: String(body.lat) } : undefined,
      lng: body.lng !== undefined ? { N: String(body.lng) } : undefined,
    },
  } as any));
  return NextResponse.json({ ok: true });
}


