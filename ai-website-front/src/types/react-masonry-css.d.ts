declare module 'react-masonry-css' {
    import { ReactNode } from 'react';

    export interface MasonryProps {
        breakpointCols?: number | { [key: string]: number; default?: number };
        className?: string;
        columnClassName?: string;
        children?: ReactNode;
    }

    declare const Masonry: React.FunctionComponent<MasonryProps>;
    export default Masonry;
} 