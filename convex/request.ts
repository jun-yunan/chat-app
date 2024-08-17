import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
    args: {
        email: v.string(),
    },
    handler: async (context, args) => {
        const identity = await context.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        if (args.email === identity.email) {
            throw new ConvexError("Cannot request yourself");
        }

        const currentUser = await getUserByClerkId({ context, clerkId: identity.subject });

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

        const receiver = await context.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!receiver) {
            throw new ConvexError("Receiver not found");
        }

        const requestAlreadySent = await context.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", receiver._id).eq("sender", currentUser._id)
            )
            .unique();

        if (requestAlreadySent) {
            throw new ConvexError("Request already sent");
        }

        const requestAlreadyReceived = await context.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", currentUser._id).eq("sender", receiver._id)
            )
            .unique();

        if (requestAlreadyReceived) {
            throw new ConvexError("This user has already sent you a request");
        }

        const friends1 = await context.db
            .query("friends")
            .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
            .collect();

        const friends2 = await context.db
            .query("friends")
            .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
            .collect();

        if (
            friends1.some((f) => f.user2 === receiver._id) ||
            friends2.some((f) => f.user1 === receiver._id)
        ) {
            throw new ConvexError("You are already friends with this user");
        }

        const request = await context.db.insert("requests", {
            sender: currentUser._id,
            receiver: receiver._id,
        });

        return request;
    },
});

export const deny = mutation({
    args: {
        id: v.id("requests"),
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

        const request = await context.db.get(args.id);

        if (!request || request.receiver !== currentUser._id) {
            throw new ConvexError("There was an error denying this request");
        }

        await context.db.delete(request._id);
    },
});

export const accept = mutation({
    args: {
        id: v.id("requests"),
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

        const request = await context.db.get(args.id);

        if (!request || request.receiver !== currentUser._id) {
            throw new ConvexError("There was an error accepting this request");
        }

        const conversationId = await context.db.insert("conversations", {
            isGroup: false,
        });

        await context.db.insert("friends", {
            user1: currentUser._id,
            user2: request.sender,
            conversationId,
        });

        await context.db.insert("conversationMembers", {
            memberId: currentUser._id,
            conversationId,
        });

        await context.db.insert("conversationMembers", {
            memberId: request.sender,
            conversationId,
        });

        await context.db.delete(request._id);
    },
});
