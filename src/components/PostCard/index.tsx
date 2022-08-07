import NextLink from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './post-card.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps): JSX.Element => {
  return (
    <div className={styles.card}>
      <NextLink href={`/post/${post.uid}`}>
        <a>
          <h2>{post.data.title}</h2>
          <p className={styles.subtitle}>{post.data.subtitle}</p>
          <div className={styles.post_info}>
            <time>
              <span>
                <FiCalendar />
              </span>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <span>
                <FiUser />
              </span>
              {post.data.author}
            </p>
          </div>
        </a>
      </NextLink>
    </div>
  );
};
