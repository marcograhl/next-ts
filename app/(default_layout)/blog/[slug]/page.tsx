import { BlogImageRest, BlogPostRest } from '@/types/blog-types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
type Props = {
  params: {
    slug: string;
  };
};

const WP_REST_BASE = process.env.WP_REST_BASE
const WP_GRAPHQL_BASE = process.env.WP_GRAPHQL_BASE

export default async function BlogPostPage({ params: { slug } }: Props) {
  const response = await fetch(
    `https://react.webworker.berlin/wp-json/wp/v2/posts?slug=${slug}`
  );

  const posts = (await response.json()) as BlogPostRest[];

  const post = posts[0];

  if (!post) {
    notFound();
  }

  // Hier prüfen, ob in post eine Bild-Id steckt und dann ggf. die Bilddaten
  // über die Schnittstelle laden.

  const imageData = await getImageData(post.featured_media);

  return (
    <div>
      <header>
        <h1>{post.title.rendered}</h1>
        <time dateTime={new Date(post.date).toLocaleDateString()}>
          {new Date(post.date).toLocaleDateString('de')}
        </time>
      </header>
      {/* Bild, falls Bilddaten vorhanden, mit der Image-Komponente darstellen. */}
      {imageData && (
        <Image
          className="full-width-image"
          src={imageData.guid.rendered}
          width={imageData.media_details.width}
          height={imageData.media_details.height}
          alt={imageData.alt_text}
          sizes="(max-width: 56rem) 90vw,  54rem"
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </div>
  );
}

async function getImageData(imageId: number) {
  // Prüfe, ob imageId 0 ist
  if (!imageId) {
    return null;
  }

  const response = await fetch(
    `https://react.webworker.berlin/wp-json/wp/v2/media/${imageId}`
  );

  if (response.status === 404) {
    return null;
  }

  const imageData = (await response.json()) as BlogImageRest;

  return imageData;
}


/* Mit dieser Funktion können alle Werte von slug, die aktuell bekannt sind,
schon vorab an Next mitgeteilt werden, so dass die Seiten für diese Slugs
schon beim build erzeugt werden können, und nicht dynamisch beim ersten Aufrufen
des Slugs (mit Wartezeit) erzeugt werden müssen.
https://beta.nextjs.org/docs/api-reference/generate-static-params
*/
export async function generateStaticParams() {
  const response = await fetch(`${WP_REST_BASE}/posts`);

  const posts = (await response.json()) as BlogPostRest[];

  return posts.map((post) => ({
	slug: post.slug,
  }));
}

