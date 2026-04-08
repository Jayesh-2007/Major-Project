const loadEnv = require("./loadEnv");

loadEnv();

function buildMongoUrl() {
  if (process.env.MONGO_URL) {
    return process.env.MONGO_URL;
  }

  const host = process.env.MONGO_HOST || "127.0.0.1";
  const port = process.env.MONGO_PORT || "27017";
  const dbName = process.env.MONGO_DB || "listingsdb";
  const authDisabled =
    (process.env.MONGO_AUTH_ENABLED || "false").toLowerCase() === "false";
  const username = process.env.MONGO_USER || "listings_user";
  const password = process.env.MONGO_PASSWORD;
  const authSource = process.env.MONGO_AUTH_SOURCE || dbName;

  if (authDisabled) {
    return `mongodb://${host}:${port}/${dbName}`;
  }

  if (!password) {
    throw new Error(
      "Missing MongoDB credentials. Set MONGO_URL or set MONGO_PASSWORD, or set MONGO_AUTH_ENABLED=false for local development without authentication.",
    );
  }

  return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${dbName}?authSource=${encodeURIComponent(authSource)}`;
}

module.exports = buildMongoUrl;
