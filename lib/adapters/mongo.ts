import { Connection } from "@/types/connection";
import { MongoClient, ServerApiVersion } from "mongodb";

export const mgConnector = async (connection: Connection) => {
  const mongoUri: string = `${connection.protocol}://${connection.user}:${
    connection.password
  }@${connection.host}${connection.port ? `:${connection.port}` : ""}${
    connection.database ? `/${connection.database}` : ""
  }${
    connection.search
      ? connection.search.startsWith("?")
        ? connection.search
        : `?${connection.search}`
      : ""
  }`;
  const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  return client;
};
