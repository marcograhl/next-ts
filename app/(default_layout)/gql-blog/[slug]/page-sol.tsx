import type { Metadata } from 'next';
import { request, gql } from 'graphql-request';
import { BlogPostFullGql } from '@/types/blog-types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
type Props = {
  params: {
    slug: string;
  };
};

export const revalidate = 600;

const WP_GRAPHQL_BASE = process.env.WP_GRAPHQL_BASE!;

export default async function GqlBlogPostPage({ params: { slug } }: Props) {
  const post = await getPostData(slug);
  const image = post?.featuredImage?.node;
  return (
    <div>
      <header>
        <h1>{post.title}</h1>
        <time dateTime={new Date(post.date).toLocaleDateString()}>
          {new Date(post.date).toLocaleDateString('de')}
        </time>
      </header>
      {/* Bild, falls Bilddaten vorhanden, mit der Image-Komponente darstellen. */}
      {image && (
        <Image
          className="full-width-image"
          src={image.guid}
          width={image.mediaDetails.width}
          height={image.mediaDetails.height}
          alt={image.altText}
          sizes="(max-width: 56rem) 90vw,  54rem"
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

async function getPostData(slug: string) {
  const query = gql`
  {
post(id: "${slug}", idType: SLUG) {
  title
  date
  content
  featuredImage {
    node {
      altText
      guid
      mediaDetails {
        width
        height
      }
    }
  }
}
}
`;

  const response = (await request(WP_GRAPHQL_BASE, query)) as {
    post: BlogPostFullGql;
  };

  const { post } = response;

  if (!post) {
    notFound();
  }

  return post;
}

export async function generateMetadata({
  params: { slug },
}: Props): Promise<Metadata> {
  const post = await getPostData(slug);

  return {
    title: post.title,
  };
}

/* Mit dieser Funktion können alle Werte von slug, die aktuell bekannt sind,
schon vorab an Next mitgeteilt werden, so dass die Seiten für diese Slugs
schon beim build erzeugt werden können, und nicht dynamisch beim ersten Aufrufen
des Slugs (mit Wartezeit) erzeugt werden müssen.
https://beta.nextjs.org/docs/api-reference/generate-static-params
*/
export async function generateStaticParams() {
  const query = gql`
    {
      posts {
        nodes {
          slug
        }
      }
    }
  `;

  const response = (await request(WP_GRAPHQL_BASE, query)) as {
    posts: {
      nodes: {
        slug: string;
      }[];
    };
  };

  return response.posts.nodes.map((post) => ({
    slug: post.slug,
  }));
}
