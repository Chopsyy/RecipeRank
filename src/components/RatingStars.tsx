import React from 'react';
import styles from '../styles/RatingStars.module.scss';

interface Props {
  score: number;
  onRate?: (score: number) => void;
}

export const RatingStars: React.FC<Props> = ({ score, onRate }) => (
  <div className={styles.stars}>
    {[...Array(10)].map((_, i) => (
      <span
        key={i}
        className={i < score ? styles.filled : styles.empty}
        style={{ cursor: onRate ? 'pointer' : 'default' }}
        onClick={onRate ? () => onRate(i + 1) : undefined}
        title={`Rate ${i + 1}`}
      >
        ★
      </span>
    ))}
  </div>
);
