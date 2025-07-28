import { postgresConfig } from "@/types/connection";
import { Client } from "pg";

export const pgConnector = async (configs: postgresConfig) => {
  const client = new Client(configs);

  await client.connect();

  return client;
};
