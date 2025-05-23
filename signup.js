import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setErr(data.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-gray-800 rounded-2xl space-y-4"
      >
        <h1 className="text-xl text-white">Sign Up</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input
          type="text"
          placeholder="Username"
          value={user.username}
          onChange={e => setUser({ ...user, username: e.target.value })}
          className="w-full p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={e => setUser({ ...user, password: e.target.value })}
          className="w-full p-2 rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-gray-700 rounded text-white"
        >
          Create Account 😭
        </button>
      </form>
    </div>
  );
}
