import Image from "next/image";
import { FunctionComponent } from "react";

interface LogoLoadingProps {
    size?: number;
}

const LogoLoading: FunctionComponent<LogoLoadingProps> = ({ size = 100 }) => {
    return (
        <div className="h-full w-full flex justify-center items-center">
            <Image
                src="/logo.svg"
                width={size}
                height={size}
                alt="Logo"
                className="animate-pulse duration-700"
            />
        </div>
    );
};

export default LogoLoading;
