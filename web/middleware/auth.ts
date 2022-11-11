import { AuthQuery, BillingSettings, Shopify } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry.js";
import { Application } from "express";
import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";
import { BillingSettingsType } from "../index.js";

export default function applyAuthMiddleware(
  app: Application,
  {
    billing,
  }: {
    billing: BillingSettingsType;
  },
) {
  app.get("/api/auth", async (req, res) => {
    return redirectToAuth(req, res, app);
  });

  app.get<any, any, any, any, AuthQuery>(
    "/api/auth/callback",
    async (req, res) => {
      try {
        const session = await Shopify.Auth.validateAuthCallback(
          req,
          res,
          req.query,
        );
        if (!session.accessToken) {
          throw new Error("No access token found in session");
        }

        const responses = await Shopify.Webhooks.Registry.registerAll({
          shop: session.shop,
          accessToken: session.accessToken,
        });

        Object.entries(responses).map(([topic, response]) => {
          const res = response as {
            success: boolean;
            result: { errors?: any[]; data?: any };
          };
          // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
          // To register the GDPR topics, please set the appropriate webhook endpoint in the
          // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
          if (!res.success && !gdprTopics.includes(topic)) {
            if (res.result.errors) {
              console.log(
                `Failed to register ${topic} webhook: ${res.result.errors[0].message}`,
              );
            } else {
              console.log(
                `Failed to register ${topic} webhook: ${JSON.stringify(
                  res.result.data,
                  undefined,
                  2,
                )}`,
              );
            }
          }
        });

        // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
        if (billing.required) {
          const [hasPayment, confirmationUrl] = await ensureBilling(
            session,
            billing,
          );

          if (!hasPayment) {
            return res.redirect(confirmationUrl);
          }
        }
        const reqHost = req.query.host;
        if (!reqHost) throw new Error("No host found in query");
        const host = Shopify.Utils.sanitizeHost(reqHost);
        if (!host) throw new Error("No host sanitized from query");
        const redirectUrl = Shopify.Context.IS_EMBEDDED_APP
          ? Shopify.Utils.getEmbeddedAppUrl(req)
          : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

        res.redirect(redirectUrl);
      } catch (e: any) {
        console.warn(e);
        switch (true) {
          case e instanceof Shopify.Errors.InvalidOAuthError:
            res.status(400);
            res.send(e.message);
            break;
          case e instanceof Shopify.Errors.CookieNotFound:
          case e instanceof Shopify.Errors.SessionNotFound:
            // This is likely because the OAuth session cookie expired before the merchant approved the request
            return redirectToAuth(req, res, app);
            break;
          default:
            res.status(500);
            res.send(e.message);
            break;
        }
      }
    },
  );
}
