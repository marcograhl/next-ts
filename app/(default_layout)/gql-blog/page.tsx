import { request, gql } from 'graphql-request';
import {
  BlogPostBaseGql,
  BlogPostTeaserGql,
} from '@/types/blog-types';
import Link from 'next/link';

export const metadata = {
  title: 'Blog',
  description: 'Die neuesten Meldungen',
};

const WP_GRAPHQL_BASE = process.env.WP_GRAPHQL_BASE!;

// Erneuere den Cache für diese Route alle 600 Sekunden,
// Alternative zur revalidate-Option in fetch.
export const revalidate = 600;

export default async function GqlBlogPage() {
  /*
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
  */
  const query = gql`
	{
  	posts {
    	nodes {
      	title
      	slug
      	date
      	excerpt
    	}
  	}
	}
  `;

  const response = (await request(WP_GRAPHQL_BASE, query)) as {
	posts: {
  	nodes: BlogPostTeaserGql[];
	};
  };

  return (
	<div>
  	<h1>Blog</h1>
  	{response.posts.nodes.map((post) => (
    	<BlogTeaserGql key={post.id} {...post} />
  	))}
	</div>
  );
}

function BlogTeaserGql({ title, excerpt, date, slug }: BlogPostTeaserGql) {
  return (
	<article>
  	<h2>
    	<Link href={`/blog/${slug}`}>{title}</Link>
  	</h2>
  	<time dateTime={new Date(date).toLocaleDateString()}>
    	{new Date(date).toLocaleDateString('de')}
  	</time>
  	<div dangerouslySetInnerHTML={{ __html: excerpt }} />
	</article>
  );
}



