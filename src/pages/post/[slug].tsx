import { GetStaticPaths, GetStaticProps } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const wordsPerContent = post.data.content.reduce((total, content): number => {
    const headingTotalWords = content.heading.split(' ').length;
    const bodyTotalWords = RichText.asText(content.body)
      .replace(/(<([^>]+)>)/g, '')
      .split(' ').length;

    const contentTotalWords = headingTotalWords + bodyTotalWords;
    // eslint-disable-next-line no-param-reassign
    total += contentTotalWords;

    return total;
  }, 0);

  const wordsPerContentReadByHuman = 200;

  const relatedReadTime = Math.ceil(
    wordsPerContent / wordsPerContentReadByHuman
  );

  return (
    <div className={styles.container}>
      <div className={styles.image}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <div className={styles.content}>
        <h1>{post.data.title}</h1>
        <div className={styles.postCreationInfo}>
          <time>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <p>
            <FiUser />
            {post.data.author}
          </p>
          <p>
            <FiClock />
            {`${relatedReadTime} min`}
          </p>
        </div>
        <div className={styles.content}>
          {post.data.content.map(contentItem => {
            return (
              <article key={contentItem.heading}>
                <h2>{contentItem.heading}</h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(contentItem.body),
                  }}
                />
              </article>
            );
          })}
        </div>
        <div className={styles.linkWrapper}>
          <NextLink href="/" passHref>
            <a className={styles.link}>Voltar para home</a>
          </NextLink>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('publication');

  const pathsResult = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: pathsResult,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug));

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(contentItem => ({
        heading: contentItem.heading,
        body: contentItem.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
