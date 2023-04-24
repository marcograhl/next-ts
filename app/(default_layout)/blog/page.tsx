import { BlogPostRest } from '@/types/blog-types';
import Link from 'next/link';

export const metadata = {
  title: 'Blog',
  description: 'Die neuesten Meldungen',
};

export default async function BlogPage() {
  const response = await fetch(
    'https://react.webworker.berlin/wp-json/wp/v2/posts', {


    next: {
      revalidate: 12000,

    }

  }
  );

  const posts = (await response.json()) as BlogPostRest[];

  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post) => (
        <BlogTeaser key={post.id} {...post} />
      ))}
    </div>
  );
}

function BlogTeaser({ title, excerpt, date, slug }: BlogPostRest) {
  return (
    <article>
      <h2>
        <Link href={`/blog/${slug}`}>{title.rendered}</Link>
      </h2>
      <time dateTime={new Date(date).toLocaleDateString()}>
        {new Date(date).toLocaleDateString('de')}
      </time>
      <div dangerouslySetInnerHTML={{ __html: excerpt.rendered }} />
    </article>
  );
}
