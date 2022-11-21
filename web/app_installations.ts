import { Shopify } from "@shopify/shopify-api";
import prisma from "./server/prisma.js";

export const AppInstallations = {
  includes: async function (shopDomain: string) {
    const shopSessions =
      (await Shopify.Context.SESSION_STORAGE.findSessionsByShop?.(
        shopDomain,
      )) || [];

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) {
          await prisma.shop.upsert({
            where: { shop: shopDomain },
            update: {},
            create: {
                shop: shopDomain,
                scopes: session.scope as string,
                isInstalled: true,
                installedAt: new Date(),
                installCount: 1,
                subscribeCount: 1,
                showOnboarding: false,
              }
          });
          return true;
        }
      }
    }

    return false;
  },

  delete: async function (shopDomain: string) {
    const shopSessions =
      (await Shopify.Context.SESSION_STORAGE.findSessionsByShop?.(
        shopDomain,
      )) || [];
    if (shopSessions.length > 0) {
      const deleteSession = await Shopify.Context.SESSION_STORAGE.deleteSessions?.(
        shopSessions.map((session) => session.id),
      );
      if (deleteSession) {
        await prisma.shop.update({
            where: { shop: shopDomain },
            data: {
                isInstalled: false,
            }
        });
      }
    }
  },
};
