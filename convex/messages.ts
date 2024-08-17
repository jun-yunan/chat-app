import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const get = query({
    args: {
        id: v.id("conversations"),
    },
    handler: async (context, args) => {
        const identity = await context.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const currentUser = await getUserByClerkId({ context, clerkId: identity.subject });

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const membership = await context.db
            .query("conversationMembers")
            .withIndex("by_memberId_conversationId", (q) =>
                q.eq("memberId", currentUser._id).eq("conversationId", args.id)
            )
            .unique();

        if (!membership) {
            throw new ConvexError("You are not a member of this conversation");
        }

        const messages = await context.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
            .order("desc")
            .collect();

        const messageWithUsers = await Promise.all(
            messages.map(async (message) => {
                const messageSender = await context.db.get(message.senderId);

                if (!messageSender) {
                    throw new ConvexError("Could not find sender of message");
                }

                return {
                    message,
                    senderImage: messageSender.imageUrl,
                    senderName: messageSender.username,
                    isCurrentUser: messageSender._id === currentUser._id,
                };
            })
        );

        return messageWithUsers;
    },
});
