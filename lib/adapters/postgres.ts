import { Connection } from "@/types/connection";
import { Client } from "pg";

export const pgConnector = async (connection: Connection) => {
  const postgresUri = `postgresql://${connection.user}:${connection.password}@${
    connection.host
  }${connection.port ? `:${connection.port}` : ""}${
    connection.database ? `/${connection.database}` : ""
  }${
    connection.search
      ? connection.search.startsWith("?")
        ? connection.search
        : `?${connection.search}`
      : ""
  }`;
  const client = new Client({ connectionString: postgresUri });

  await client.connect();

  return client;
};
