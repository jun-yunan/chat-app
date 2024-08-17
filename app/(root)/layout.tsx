import SidebarWrapper from "@/components/shared/sidebar/SidebarWrapper";
import { FunctionComponent } from "react";

type LayoutRootProps = React.PropsWithChildren<{
    name: string;
}>;

const LayoutRoot: FunctionComponent<LayoutRootProps> = ({ children }) => {
    return <SidebarWrapper>{children}</SidebarWrapper>;
};

export default LayoutRoot;
