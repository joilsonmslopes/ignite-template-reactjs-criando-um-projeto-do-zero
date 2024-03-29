import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getPostPagination = async (): Promise<void> => {
    setIsLoading(true);
    if (currentPage !== 1 && !nextPage) {
      return;
    }

    const data = await fetch(`${nextPage}`).then(response => response.json());

    const newPosts = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...newPosts]);
    setCurrentPage(data.page);
    setNextPage(data.next_page);
    setIsLoading(false);
  };

  if (process.browser) {
    const utterances = document.querySelector('.utterances');
    const body = document.querySelector('body');

    if (utterances) {
      body.removeChild(utterances);
    }
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | home</title>
      </Head>
      <section className={styles.container}>
        <main>
          {posts.map(post => (
            <PostCard key={post.uid} post={post} />
          ))}
          {nextPage &&
            (isLoading ? (
              <div className={styles.loadingWrapper}>
                <div className={styles.loading}>
                  <div />
                  <div />
                  <div />
                </div>
              </div>
            ) : (
              <Button onGetPostPagination={getPostPagination}>
                Carregar mais posts
              </Button>
            ))}
        </main>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.getByType('publication', {
    pageSize: 1,
  });

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  };
};
