import React from "react";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";

type Props = {
    children: React.ReactNode;
};

const SidebarWrapper = ({ children }: Props) => {
    return (
        <div className="h-full w-full flex flex-col lg:flex-row p-4 gap-4">
            <MobileNav />
            <DesktopNav />
            <main className="h-[calc(100%-80px)] lg:h-full w-full flex gap-4">{children}</main>
        </div>
    );
};

export default SidebarWrapper;
