import { GetStaticPaths, GetStaticProps } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useEffect } from 'react';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  uid?: string;
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
  posts: Post[];
}

export default function Post({ post, posts }: PostProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    if (process.browser) {
      const utterances = document.querySelector('.utterances');
      const script = document.createElement('script');

      const body = document.querySelector('body');

      script.setAttribute('async', '');
      script.setAttribute('src', 'https://utteranc.es/client.js');
      script.setAttribute(
        'repo',
        'joilsonmslopes/ignite-template-reactjs-criando-um-projeto-do-zero'
      );
      script.setAttribute('issue-term', 'url');
      script.setAttribute('theme', 'github-dark');
      script.setAttribute('crossOrigin', 'anonymous');

      body.appendChild(script);

      if (utterances) {
        body.removeChild(utterances);
        body.appendChild(script);
      }
    }
  }, [router.asPath]);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const postPathParam = router.asPath?.split('/')[2];

  const postsInfo = posts?.map(postInfo => ({
    slug: postInfo.uid,
    title: postInfo.data.title,
  }));

  const postIndex = postsInfo?.findIndex(item => item.slug === postPathParam);

  const currentPost = postsInfo?.find(
    (_, index) => index === Math.max(postIndex)
  );

  const previousPost = postsInfo?.find(
    (_, index) => index === Math.max(postIndex - 1, 0)
  );

  const nextPost = postsInfo?.find(
    (_, index) => index === Math.min(postIndex + 1, postsInfo.length - 1)
  );

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
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>
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
          <section className={styles.content}>
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
          </section>
          <div className={styles.previousOrNextPost}>
            {previousPost?.slug !== currentPost?.slug ? (
              <div className={styles.button}>
                <NextLink href={`/post/${previousPost?.slug}`} passHref>
                  <a className={styles.link}>
                    <span>{previousPost?.title}</span>
                    Post anterior
                  </a>
                </NextLink>
              </div>
            ) : (
              <div />
            )}
            {nextPost?.slug !== currentPost?.slug && (
              <div className={`${styles.button} ${styles.right}`}>
                <NextLink href={`/post/${nextPost?.slug}`} passHref>
                  <a className={styles.link}>
                    <span>{nextPost?.title}</span>
                    Próximo post
                  </a>
                </NextLink>
              </div>
            )}
          </div>
          <div className={styles.linkWrapper}>
            <NextLink href="/" passHref>
              <a className={styles.link}>Voltar para home</a>
            </NextLink>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('publication');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug));

  const posts = (await prismic.getByType('publication')).results;

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
      posts,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
