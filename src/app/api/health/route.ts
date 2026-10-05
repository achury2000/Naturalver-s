import { MongoClient } from 'mongodb';

/**
 * GET /api/health
 *
 * Liveness + readiness probe used by compose.prod.yaml so that
 * `docker compose up --wait` blocks until the app is actually able to
 * serve traffic (i.e. MongoDB is reachable).
 *
 * Note: this route lives at `api/health/`, not inside `api/[[...slug]]/`.
 * Next.js always prefers the static segment over the catch-all, so this
 * handler wins over Payload's REST catch-all for the `/api/health` path.
 *
 * The check uses a module-scoped, lazily-created MongoClient that is reused
 * across probes instead of opening a new connection every health check.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/naturalvers';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  if (client) return client;
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 }).connect()
      .then((c) => {
        client = c;
        return c;
      })
      .catch((err) => {
        // Allow a later probe to retry with a fresh client.
        clientPromise = null;
        throw err;
      });
  }
  return clientPromise;
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const mongo = await getClient();
    await mongo.db().command({ ping: 1 });

    return Response.json(
      {
        status: 'ok',
        db: 'up',
        uptime: Math.round(process.uptime()),
        responseTimeMs: Date.now() - startedAt,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        db: 'down',
        error: error instanceof Error ? error.message : 'unknown error',
        responseTimeMs: Date.now() - startedAt,
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
