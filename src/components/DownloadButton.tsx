'use client';

import { useState } from 'react';
import styles from './DownloadButton.module.css';

interface Props {
  onDownload: () => Promise<void>;
}

export default function DownloadButton({ onDownload }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      id="download-btn"
      className={styles.button}
      onClick={handleClick}
      disabled={isDownloading}
      type="button"
    >
      <span className={styles.icon}>⬇</span>
      <span>{isDownloading ? 'Generating...' : 'Download WAV'}</span>
    </button>
  );
}
