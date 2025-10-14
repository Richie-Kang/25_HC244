import { type PropsWithChildren } from "react";

export default function LegalLayout({ children }: PropsWithChildren) {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-3xl mx-auto prose dark:prose-invert">
                {children}
            </div>
        </div>
    );
} 