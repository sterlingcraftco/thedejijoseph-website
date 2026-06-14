import { useState } from 'react';

/**
 * Newsletter subscribe form — the one genuinely interactive piece on the
 * otherwise-static Notes page, so it ships as a React island (client:visible).
 * Posts to the Hono backend at `${apiBase}/ghost/subscribe`, which Caddy
 * proxies to localhost:3000.
 */
interface Props {
  apiBase?: string;
}

export default function SubscribeForm({ apiBase = '/api' }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${apiBase}/ghost/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to subscribe');
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 border border-primary/30 bg-primary/5">
        <p className="font-display font-bold text-lg text-primary mb-2">You're in! 🎉</p>
        <p className="body-regular text-muted-foreground">
          Check your inbox for a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-body text-sm"
        />
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {error && <p className="text-destructive text-sm mt-4">{error}</p>}
    </>
  );
}
