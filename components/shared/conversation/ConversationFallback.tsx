import { Card } from "@/components/ui/card";
import React from "react";

type Props = {};

const ConversationFallback = (props: Props) => {
    return (
        <Card className="hidden lg:flex h-full w-full p-2 items-center bg-secondary text-secondary-foreground">
            Select/start a conversation to get started!
        </Card>
    );
};

export default ConversationFallback;
