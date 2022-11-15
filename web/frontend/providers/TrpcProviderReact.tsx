import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/trpc';
import { useAuthenticatedFetch } from "../hooks";

export default function TrpcProviderReact({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();
    const fetchFunction = useAuthenticatedFetch();
    const [trpcClient] = useState(() =>
        trpc.createClient({
            // @ts-ignore
            fetch: fetchFunction,
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                }),
            ]
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
