import React from 'react';
import Image from 'next/image';

const BlogCard = ({
    image,
    title,
    subtitle,
    author,
    date,
}: {
    image: string;
    title: string;
    subtitle: string;
    author: string;
    date: string;
}) => {
    return (
        <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
            <Image
                src={image}
                alt={title}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
                <div className="text-xs text-gray-500">
                    <p>{author}</p>
                    <p>{date}</p>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
