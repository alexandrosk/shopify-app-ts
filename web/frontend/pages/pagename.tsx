import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { trpc } from "../utils/trpc";

export default function PageName() {
  const { data, isLoading } = trpc.getUser.useQuery();
  const shop = trpc.getShop.useQuery();
  //const session = trpc.getSession.useQuery();
  if (isLoading) return <div>Loading...</div>;
  else
    return (
      <Page>
        <TitleBar
          title="Page name"
          primaryAction={{
            content: "Primary action",
            onAction: () => console.log("Primary action"),
          }}
          secondaryActions={[
            {
              content: "Secondary action",
              onAction: () => console.log("Secondary action"),
            },
          ]}
        />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Heading>{data}</Heading>
              <TextContainer>
                <p>{data}</p>
                <p>App installed on stores: {shop?.data}</p>
              </TextContainer>
            </Card>
            <Card sectioned>
              <Heading>Heading</Heading>
              <TextContainer>
                <p>Body</p>
              </TextContainer>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned>
              <Heading>Heading</Heading>
              <TextContainer>
                <p>Body</p>
              </TextContainer>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
}
