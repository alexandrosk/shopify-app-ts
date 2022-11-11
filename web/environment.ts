import { envsafe, str } from "envsafe";

export const environment = envsafe({
  NODE_ENV: str({ default: "development" }),
  BACKEND_PORT: str({}),
  PORT: str({}),
  SHOPIFY_API_KEY: str({}),
  SHOPIFY_API_SECRET: str({}),
  SCOPES: str({}),
  HOST: str({}),
});
