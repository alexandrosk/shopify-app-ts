// @ts-check
import * as dotenv from 'dotenv'
dotenv.config({ path: `${process.cwd()}/../.env` });
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import {
  Shopify,
  LATEST_API_VERSION,
  BillingSettings,
} from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { AppInstallations } from "./app_installations.js";
import { environment } from "./environment.js";
import * as trpcExpress from "@trpc/server/adapters/express";
import webhooks from "./webhooks.js";
import {appRouter} from "./server/routers/_app.js";
import {createContext} from "./server/context.js";
const USE_ONLINE_TOKENS = false;

const PORT = parseInt(environment.BACKEND_PORT || environment.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;



Shopify.Context.initialize({
  API_KEY: environment.SHOPIFY_API_KEY,
  API_SECRET_KEY: environment.SHOPIFY_API_SECRET,
  SCOPES: environment.SCOPES.split(","),
  HOST_NAME: environment.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: environment.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.RedisSessionStorage(process.env.REDIS_URL as any),
});

Shopify.Webhooks.Registry.addHandlers(webhooks);

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
export type BillingSettingsType<T = boolean> = T extends true
  ? BillingSettings & { required: T }
  : { required: T };

const BILLING_SETTINGS: BillingSettingsType = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = environment.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS,
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e: any) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    }),
  );

  app.use(
      '/api/trpc',
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
      }),
  );


  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens"),
    );

    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens"),
    );
    console.log(session);
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e: any) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());


  app.post('/api/graphql', async (req: any, res: any) => {
    const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens"),
    );
    const shopName: string|undefined = session?.shop;
    const token: string|undefined = session?.accessToken;

    const options = {
      data: req.body
    };

    try {
      if (shopName && token) {
        const client = new Shopify.Clients.Graphql(shopName, token);
        const response = await client.query(options);

        res.status(200).send(response.body);
      }

    } catch (err: any) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  });

  app.use((req, res, next) => {
    const shopQuery = req.query.shop;
    if (!shopQuery) throw new Error("No shop query parameter provided");
    if (typeof shopQuery !== "string")
      throw new Error("Invalid shop query parameter provided");
    const shop = Shopify.Utils.sanitizeShop(shopQuery);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop,
        )} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn,
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn,
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (!shop) throw new Error("Invalid shop provided");
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html",
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}



createServer().then(({ app }) => app.listen(PORT));
