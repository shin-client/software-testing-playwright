import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

export async function syncSeatPool(): Promise<void> {
  const envTestPath = path.resolve(process.cwd(), ".env.test");
  if (fs.existsSync(envTestPath)) {
    dotenv.config({ path: envTestPath, override: false });
  }

  const candidateUrls: string[] = [];

  // 1. In local dev, try Doppler stg DB_URL if ticket-booking directory exists
  if (!process.env.GITHUB_ACTIONS && fs.existsSync("../ticket-booking")) {
    try {
      const dopplerUrl = execSync("doppler secrets get DB_URL --plain -c stg", {
        cwd: "../ticket-booking",
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim();
      if (dopplerUrl) {
        candidateUrls.push(dopplerUrl);
      }
    } catch {
      // Doppler CLI or token unavailable
    }
  }

  // 2. Try environment variables from .env.test or process.env
  if (process.env.DATABASE_URL) candidateUrls.push(process.env.DATABASE_URL);
  if (process.env.DB_URL) candidateUrls.push(process.env.DB_URL);

  // 3. Fallback to default local/CI PostgreSQL service container
  candidateUrls.push(
    "postgresql://postgres:postgrespassword@localhost:5432/ticket_booking?sslmode=disable",
  );

  let synced = false;

  for (const dbUrl of candidateUrls) {
    let client: pg.Client | null = null;
    try {
      client = new pg.Client({
        connectionString: dbUrl,
        connectionTimeoutMillis: 5000,
      });
      await client.connect();

      // Query earliest upcoming show with hall_id
      const showRes = await client.query<{ id: string; hall_id: string }>(`
        SELECT id, hall_id FROM shows 
        ORDER BY start_time ASC 
        LIMIT 1;
      `);

      if (showRes.rows.length > 0) {
        const show = showRes.rows[0];
        const seatsRes = await client.query<{ id: string }>(
          `SELECT id FROM seats WHERE hall_id = $1 ORDER BY row ASC, number ASC;`,
          [show.hall_id],
        );
        const seatIds = seatsRes.rows.map((r) => r.id);

        const seatPoolPath = path.resolve(
          process.cwd(),
          "fixtures/seat-pool.json",
        );
        fs.writeFileSync(
          seatPoolPath,
          JSON.stringify({ showId: show.id, seatIds }, null, 2),
        );
        console.log(
          `[SyncSeats] Successfully synced seat-pool.json from DB: show ${show.id} with ${seatIds.length} seats.`,
        );
        synced = true;
      }

      await client.end();
      if (synced) break;
    } catch (err) {
      console.warn(
        `[SyncSeats] Failed connecting to ${dbUrl.replace(/:[^:@]*@/, ":***@")}:`,
        (err as Error).message,
      );
      if (client) {
        try {
          await client.end();
        } catch {
          // Ignore close error
        }
      }
    }
  }

  if (!synced) {
    console.error(
      "[SyncSeats] Could not connect to any database candidate to sync seat-pool.json.",
    );
    process.exit(1);
  }
}

void syncSeatPool();
