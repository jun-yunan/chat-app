import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";

export const get = query({
    args: {},
    handler: async (context, args) => {
        const identity = await context.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const currentUser = await getUserByClerkId({ context, clerkId: identity.subject });
        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const friendships1 = await context.db
            .query("friends")
            .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
            .collect();

        const friendships2 = await context.db
            .query("friends")
            .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
            .collect();

        const friendships = [...friendships1, ...friendships2];

        const friends = await Promise.all(
            friendships.map(async (friendship) => {
                const friend = await context.db.get(
                    friendship.user1 === currentUser._id ? friendship.user2 : friendship.user1
                );

                if (!friend) {
                    throw new ConvexError("Friend not found");
                }

                return friend;
            })
        );

        return friends;
    },
});
