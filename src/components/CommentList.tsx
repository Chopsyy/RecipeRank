import React from 'react';
import styles from '../styles/CommentList.module.scss';
import { Comment } from '../types/Comment';

interface Props {
  comments: Comment[];
}

export const CommentList: React.FC<Props> = ({ comments }) => (
  <div className={styles.list}>
    {comments.map((comment) => (
      <div key={comment.id} className={styles.comment}>
        <strong>{comment.user}:</strong> {comment.comment}
      </div>
    ))}
  </div>
);
