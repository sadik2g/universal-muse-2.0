import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";

async function testConnection() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log("✅ Database connection successful!");
    console.log("Users found:", result.length);
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
