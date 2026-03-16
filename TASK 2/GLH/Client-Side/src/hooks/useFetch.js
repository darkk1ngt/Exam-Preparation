import { useEffect, useState } from 'react';
import config from '../config.js';

/**
 * Fetches data from the API whenever `url` changes.
 * Returns { data, loading, error }.
 *
 * @param {string | null} url  Path starting with /api/…  (null = skip fetch)
 */
export function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(url));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!url) return;

        let is_active = true;
        setLoading(true);
        setError('');

        (async () => {
            try {
                const response = await fetch(`${config.apiUrl}${url}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    throw new Error(body.error || 'Request failed.');
                }

                const result = await response.json();
                if (is_active) setData(result);
            } catch (err) {
                if (is_active) setError(err.message);
            } finally {
                if (is_active) setLoading(false);
            }
        })();

        return () => {
            is_active = false;
        };
    }, [url]);

    return { data, loading, error };
}
