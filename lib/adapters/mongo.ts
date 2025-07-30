import { mongoConfig } from "@/types/connection";
import { MongoClient, ServerApiVersion } from "mongodb";

export const mgConnector = async ({
  configs,
  url,
}: {
  configs?: mongoConfig;
  url?: string;
}) => {
  const client = new MongoClient(
    url
      ? url
      : `mongodb://${configs?.user}:${configs?.password}@${configs?.host}:${configs?.port}/${configs?.database}`,
    {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    }
  );

  await client.connect();

  return client;
};
