import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { NextUIProvider } from '@nextui-org/react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/Ho3einWave/ton-smartcontract-frontend/main/public/manifest.json">
                <NextUIProvider>
                    <main className="dark min-h-[100dvh] text-foreground bg-background">
                        <RouterProvider router={router} />
                    </main>
                </NextUIProvider>
            </TonConnectUIProvider>
        </QueryClientProvider>
    </StrictMode>,
);
