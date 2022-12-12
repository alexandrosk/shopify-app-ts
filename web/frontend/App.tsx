import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import TrpcProviderReact from "./providers/TrpcProviderReact";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <TrpcProviderReact>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Trpc",
                    destination: "/pagename",
                  },
                  {
                    label: "Billing",
                    destination: "/plan",
                  },
                ]}
              />
              <Routes pages={pages} />
            </TrpcProviderReact>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
