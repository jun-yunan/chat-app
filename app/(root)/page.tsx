"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { redirect } from "next/navigation";
export default function Home() {
    useEffect(() => {
        redirect("/conversations");
    }, []);

    return null;
}
