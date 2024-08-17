import { QueryCtx, MutationCtx } from "./_generated/server";

export const getUserByClerkId = async ({
    context,
    clerkId,
}: {
    context: QueryCtx | MutationCtx;
    clerkId: string;
}) => {
    return await context.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();
};
