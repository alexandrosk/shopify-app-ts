# 🌍Shopify Node App with Typescript tRPC, Redis and Prisma [WIP]

This is a template for building a [Shopify app](https://shopify.dev/apps/getting-started) using Node and React.

🚀 It contains the basics for building a Shopify app + Typesafety, tRPC routers redis and prisma! 🚀

#### 🚧 This is kinda WIP please use at your own risk 
 

## 🟢 What works
[x] - Shopify CLI, create theme-app-extensions deploy etc

[x] - tRPC

[x] - Express & Node

[x] - Redis

[x] - Prisma DB client works


## Benefits

Typesafety over all! 
Plus main node shopify functionalities like theme-app-extensions etc
Railway for redis and prisma

## Tech Stack

This template combines a number of third party open-source tools:

- [Express](https://expressjs.com/) builds the backend.
- [Vite](https://vitejs.dev/) builds the [React](https://reactjs.org/) frontend.
- [React Router](https://reactrouter.com/) is used for routing. We wrap this with file-based routing.
- [React Query](https://react-query.tanstack.com/) queries the Admin API.
- [Prisma](https://www.prisma.io/) ORM
- [Trpc](https://trpc.io/) for API routing
- [Redis](https://redis.io/) for caching

The following Shopify tools complement these third-party tools to ease app development:

- [Shopify API library](https://github.com/Shopify/shopify-node-api) adds OAuth to the Express backend. This lets users install the app and grant scope permissions.
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react) adds authentication to API requests in the frontend and renders components outside of the App’s iFrame.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Custom hooks](https://github.com/Shopify/shopify-frontend-template-react/tree/main/hooks) make authenticated requests to the Admin API.
- [File-based routing](https://github.com/Shopify/shopify-frontend-template-react/blob/main/Routes.jsx) makes creating new pages easier.

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must [create a development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) if you don’t have one.
2. Add you .env with your keys

### Installing the template

Clone this repository :D 

#### Local Development

[The Shopify CLI](https://shopify.dev/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables, runs commands in parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager. Run one of the following commands from the root of your app.

Using pnpm:

```shell
pnpm run dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

### Application Storage

This template uses planetscale, but you can use anything you want with your prisma file. 
You can change the url on the .env file.

### Build

The frontend is a single page app. It requires the `SHOPIFY_API_KEY`, which you can find on the page for your app in your partners dashboard. Paste your app’s key in the command for the package manager of your choice:

Using pnpm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME pnpm run build
```

You do not need to build the backend.

## Hosting

I personally prefer digitalocean apps, easy to setup and cheap! You can use this link to signup with a referral :) 

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.digitaloceanspaces.com/WWW/Badge%202.svg)](https://www.digitalocean.com/?refcode=f57eb0b578e8&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

When you reach the step for [setting up environment variables](https://shopify.dev/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Some things to watch out for

### Using `express.json` middleware

If you use the `express.json()` middleware in your app **and** if you use `Shopify.Webhooks.Registry.process()` to process webhooks API calls from Shopify (which we recommend), the webhook processing must occur **_before_** calling `app.use(express.json())`. See the [API documentation](https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers) for more details.

## Known issues
You can always find more info on the official shopify node app template https://github.com/Shopify/shopify-api-node/tree/main/docs

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/apps/getting-started)
- [App authentication](https://shopify.dev/apps/auth)
- [Shopify CLI](https://shopify.dev/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-node/tree/main/docs)
