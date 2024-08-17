"use client";

import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import { FunctionComponent } from "react";
import AddFriendDialog from "./_components/AddFriendDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import Request from "./_components/Request";

interface FriendsPageProps {}

const FriendsPage: FunctionComponent<FriendsPageProps> = () => {
    const requests = useQuery(api.requests.get);
    return (
        <>
            <ItemList title="Friends" action={<AddFriendDialog />}>
                {requests ? (
                    requests.length === 0 ? (
                        <p className="w-full h-full flex items-center justify-center">
                            No friend requests not found
                        </p>
                    ) : (
                        requests.map((request) => {
                            return (
                                <Request
                                    key={request.request._id}
                                    id={request.request._id}
                                    email={request.sender.email}
                                    imageUrl={request.sender.imageUrl}
                                    username={request.sender.username}
                                />
                            );
                        })
                    )
                ) : (
                    <Loader2 className="w-8 h-8" />
                )}
            </ItemList>
            <ConversationFallback />
        </>
    );
};

export default FriendsPage;
