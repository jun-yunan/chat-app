"use client";

import LogoLoading from "@/components/shared/LogoLoading";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { FunctionComponent } from "react";

interface ConvexClientProviderProps {
    children: React.ReactNode;
}
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convexClient = new ConvexReactClient(CONVEX_URL);
const ConvexClientProvider: FunctionComponent<ConvexClientProviderProps> = ({ children }) => {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk useAuth={useAuth} client={convexClient}>
                <Authenticated>{children}</Authenticated>
                <AuthLoading>
                    <LogoLoading />
                </AuthLoading>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};

export default ConvexClientProvider;
