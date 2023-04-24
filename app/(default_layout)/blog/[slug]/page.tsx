import { BlogImageRest, BlogPostRest } from '@/types/blog-types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
type Props = {
  params: {
    slug: string;
  };
};
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
