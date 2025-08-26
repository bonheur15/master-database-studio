import { Connection } from "@/types/connection";

export const parseConnectionString = (
  str: string
): Omit<Connection, "name" | "id"> => {
  try {
    const url = new URL(str);
    const urlProtocol = url.protocol.replace(":", "");

    if (
      !["mysql", "postgres", "postgresql", "mongodb", "mongodb+srv"].includes(
        urlProtocol
      )
    ) {
      throw new Error("Unsupported protocol");
    }

    const type: Connection["type"] = urlProtocol.startsWith("mongo")
      ? "mongodb"
      : urlProtocol.startsWith("postgresql")
      ? "postgresql"
      : "mysql";

    const protocol =
      type === "mongodb" ? (urlProtocol as Connection["protocol"]) : undefined;

    const search = url.search
      ? (url.search as Connection["search"])
      : undefined;

    return {
      type,
      protocol,
      search,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      host: url.hostname,
      port: parseInt(url.port) || undefined,
      database: url.pathname.replace("/", ""),
    };
  } catch {
    throw new Error("Invalid connection string");
  }
};

export const getConnectionPayload = (
  details: Partial<Connection> | undefined
) => {
  const payload: Partial<Connection> = {
    name: details?.name,
    type: details?.type,
    host: details?.host,
    search: details?.search,
    port: details?.port,
    user: details?.user,
    password: details?.password,
    database: details?.database,
  };
  if (details?.type === "mongodb") {
    payload.protocol = details?.protocol;
  }
  return payload;
};

export function sanitizeIdentifier(identifier: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error("Invalid identifier: " + identifier);
  }
  return identifier;
}
