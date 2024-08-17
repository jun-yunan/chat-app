import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import { FunctionComponent } from "react";

interface ConversationsPageProps {}

const ConversationsPage: FunctionComponent<ConversationsPageProps> = () => {
    return <ConversationFallback />;
};

export default ConversationsPage;
