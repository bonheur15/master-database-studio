import { Connection } from "@/types/connection";
import { Client } from "pg";

export const pgConnector = async (configs: Connection) => {
  const client = new Client(configs);

  await client.connect();

  return client;
};
