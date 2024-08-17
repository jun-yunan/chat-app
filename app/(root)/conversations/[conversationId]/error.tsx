"use client"; // Error boundaries must be Client Components

import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    useEffect(() => {
        router.push("/conversations");
        // Log the error to an error reporting service
        console.error(error);
    }, [error, router]);

    return (
        // <div>
        //     <h2>Something went wrong!</h2>
        //     <button
        //         onClick={
        //             // Attempt to recover by trying to re-render the segment
        //             () => reset()
        //         }
        //     >
        //         Try again
        //     </button>
        // </div>
        <ConversationFallback />
    );
}
