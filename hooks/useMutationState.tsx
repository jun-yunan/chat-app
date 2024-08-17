import { useMutation } from "convex/react";
import { useState } from "react";
import { set } from "zod";

export const useMutationState = (mutationToRun: any) => {
    const [pending, setPending] = useState(false);

    const mutationFn = useMutation(mutationToRun);

    const mutate = (payload: any) => {
        setPending(true);

        return mutationFn(payload)
            .then((res) => {
                setPending(false);
                return res;
            })
            .catch((error) => {
                throw error;
            })
            .finally(() => setPending(false));
    };

    return { mutate, pending };
};
