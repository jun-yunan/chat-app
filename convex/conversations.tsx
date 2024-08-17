import { ConvexError, v } from "convex/values";
import { MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";
export const get = query({
  args: {
    // id: v.id("conversations"),
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

    const conversationMemberships = await context.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const conversations = await Promise.all(
      conversationMemberships?.map(async (membership) => {
        const conversation = await context.db.get(membership.conversationId);

        console.log("conversation", conversation);

        if (!conversation) {
          throw new ConvexError("Conversations not found");
        }

        return conversation;
      })
    );
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation, index) => {
        const allConversationMemberships = await context.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation?._id))
          .collect();
        // const conversationMemberships = await context.db
        //     .query("conversationMembers")
        //     .withIndex("by_conversationId", (q) =>
        //         q.eq("conversationId", conversation?._id)
        //     )
        //     .collect();
        const lastMessage = await getLastMessageDetails({
          context,
          id: conversation.lastMessageId,
        });

        const lastSeenMessage = conversationMemberships[index].lastSeenMessage
          ? await context.db.get(conversationMemberships[index].lastSeenMessage)
          : null;

        const lastSeenMessageTime = lastSeenMessage ? lastSeenMessage._creationTime : -1;

        const unseenMessages = await context.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.gt(q.field("_creationTime"), lastSeenMessageTime))
          .filter((q) => q.neq(q.field("senderId"), currentUser._id))
          .collect();

        if (conversation.isGroup) {
          return { conversation, lastMessage, unseenCount: unseenMessages.length };
        } else {
          const otherMemberships = allConversationMemberships.filter(
            (membership) => membership.memberId !== currentUser._id
          )[0];

          const otherMember = await context.db.get(otherMemberships.memberId);
          return { conversation, otherMember, lastMessage, unseenCount: unseenMessages.length };
        }
      })
    );

    return conversationsWithDetails;
  },
});

const getLastMessageDetails = async ({
  context,
  id,
}: {
  context: QueryCtx | MutationCtx;
  id: Id<"messages"> | undefined;
}) => {
  if (!id) return null;

  const message = await context.db.get(id);

  if (!message) return null;

  const sender = await context.db.get(message.senderId);
  if (!sender) return null;

  const content = getMessageContent(message.type, message.content as unknown as string);

  return {
    content,
    sender: sender.username,
  };
};

const getMessageContent = (type: string, content: string) => {
  switch (type) {
    case "text":
      return content;

    default:
      return "[Non-text]";
  }
};
