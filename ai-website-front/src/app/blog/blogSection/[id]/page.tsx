// app/blog/blogSection/[id]/page.tsx
import { Metadata } from 'next';
import { getBlogById } from '@/features/blog/services/BlogService';
import BlogSection from '@/features/blog/BlogSection';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);
  return {
    title: blog.title,
    description: blog.subtitle,
  };
}

export default async function BlogPage({ params }: PageProps) {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);
  return <BlogSection initialBlog={blog} />;
}
