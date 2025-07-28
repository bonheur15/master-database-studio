import { postgresConfig } from "@/types";
import { Client } from "pg";

export const pgConnector = async (configs: postgresConfig) => {
  const client = new Client(configs);

  await client.connect();

  return client;
};
