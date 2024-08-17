import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const remove = mutation({
    args: {
        conversationId: v.id("conversations"),
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

        const conversation = await context.db.get(args.conversationId);
        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }

        const memberships = await context.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        if (!memberships || memberships.length !== 2) {
            throw new ConvexError("This conversation does not have any members");
        }

        const friendships = await context.db
            .query("friends")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .unique();

        if (!friendships) {
            throw new ConvexError("Friend could not be found");
        }

        const messages = await context.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        await context.db.delete(args.conversationId);

        await context.db.delete(friendships._id);

        await Promise.all(messages.map(async (message) => await context.db.delete(message._id)));
    },
});
