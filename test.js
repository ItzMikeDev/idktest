// File: tailwind.config.js
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};

// File: postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// File: styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// File: pages/_app.js
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// File: lib/store.js
let users = [];

export function addUser(username, password) {
  users.push({ username, password });
}

export function findUser(username) {
  return users.find(u => u.username === username);
}

export function getUsers() {
  return users.map(u => u.username);
}

// File: pages/api/signup.js
import { addUser, findUser } from '../../lib/store';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (findUser(username)) {
    return res.status(409).json({ error: 'User exists' });
  }

  addUser(username, password);
  res.setHeader(
    'Set-Cookie',
    `username=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=86400`
  );
  return res.status(200).json({ ok: true });
}

// File: pages/api/login.js
import { findUser } from '../../lib/store';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { username, password } = req.body;
  const user = findUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.setHeader(
    'Set-Cookie',
    `username=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=86400`
  );
  return res.status(200).json({ ok: true });
}

// File: pages/api/users.js
import { getUsers } from '../../lib/store';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  return res.status(200).json({ users: getUsers() });
}

// File: pages/index.js
import { parse } from 'cookie';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const destination = cookies.username ? '/dashboard' : '/login';

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}

// File: pages/signup.js
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

// File: pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/login', {
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
        <h1 className="text-xl text-white">Login</h1>
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
          Login 😭
        </button>
      </form>
    </div>
  );
}

// File: pages/dashboard.js
import { useEffect, useState } from 'react';
import { parse } from 'cookie';
import { useRouter } from 'next/router';

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (!cookies.username) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { username: cookies.username } };
}

export default function Dashboard({ username }) {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data.users));
  }, []);

  function logout() {
    document.cookie =
      'username=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex justify-between items-center text-white">
        <h1 className="text-xl">Welcome, {username} 😭</h1>
        <button
          onClick={logout}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <div
        className="mt-6 bg-gray-800 p-4 rounded-2xl h-64 overflow-y-scroll text-white"
      >
        {users.map(u => (
          <p key={u} className="py-1">
            {u}
          </p>
        ))}
      </div>
    </div>
  );
}
