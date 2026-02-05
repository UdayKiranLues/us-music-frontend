import { useEffect, useState } from 'react';
import axios from '@/utils/axios';

export function useSongCoverUrl(songId) {
  const [coverUrl, setCoverUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!songId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setCoverUrl(null);
    axios
      .get(`/api/v1/songs/${songId}/cover-signed-url`)
      .then((res) => {
        if (isMounted) setCoverUrl(res.data.url);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [songId]);

  return { coverUrl, loading, error };
}
