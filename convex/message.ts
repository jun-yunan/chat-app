import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
    args: {
        conversationId: v.id("conversations"),
        type: v.string(),
        content: v.array(v.string()),
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
                q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (!membership) {
            throw new ConvexError("You are not a member of this conversation");
        }

        const message = await context.db.insert("messages", {
            senderId: currentUser._id,
            ...args,
        });

        await context.db.patch(args.conversationId, {
            lastMessageId: message,
        });

        return message;
    },
});
