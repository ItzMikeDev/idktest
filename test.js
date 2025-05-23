/*
Simple Next.js app for Vercel with signup, login, and a scrollable list of usernames.
Backgrounds are dark (not super-black) using Tailwind's bg-gray-900.
Stores users in-memory (demo only!).
*/

// Install dependencies:
// npm install next react react-dom js-cookie tailwindcss postcss autoprefixer
// npx tailwindcss init -p

// tailwind.config.js
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};

// styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* pages/_app.js */
import '../styles/globals.css';
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// lib/store.js  (in-memory user store)
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

// pages/api/signup.js
import { addUser, findUser } from '../../lib/store';
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (findUser(username)) return res.status(409).json({ error: 'User exists' });
  addUser(username, password);
  // set cookie
  res.setHeader('Set-Cookie', `username=${encodeURIComponent(username)}; Path=/; HttpOnly`);
  res.status(200).json({ ok: true });
}

// pages/api/login.js
import { findUser } from '../../lib/store';
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;
  const user = findUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid creds' });
  }
  res.setHeader('Set-Cookie', `username=${encodeURIComponent(username)}; Path=/; HttpOnly`);
  res.status(200).json({ ok: true });
}

// pages/api/users.js
import { getUsers } from '../../lib/store';
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }
  res.status(200).json({ users: getUsers() });
}

// pages/index.js
import { parse } from 'cookie';
export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (cookies.username) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }
  return { redirect: { destination: '/login', permanent: false } };
}
export default function Home() { return null; }

// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
export default function Signup(){
  const [user, setUser] = useState({username:'', password:''});
  const [err, setErr] = useState('');
  const r = useRouter();
  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(user)});
    if(res.ok) r.push('/dashboard'); else setErr((await res.json()).error);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={submit} className="p-6 bg-gray-800 rounded-xl space-y-4">
        <h1 className="text-xl text-white">Sign Up</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input type="text" placeholder="Username" value={user.username} onChange={e=>setUser({...user,username:e.target.value})} className="w-full p-2 rounded" />
        <input type="password" placeholder="Password" value={user.password} onChange={e=>setUser({...user,password:e.target.value})} className="w-full p-2 rounded" />
        <button type="submit" className="w-full p-2 bg-gray-700 rounded text-white">Create Account 😭</button>
      </form>
    </div>
  );
}

// pages/login.js
import { useState } from 'react'; import { useRouter } from 'next/router';
export default function Login(){
  const [user, setUser] = useState({username:'', password:''});
  const [err, setErr] = useState('');
  const r = useRouter(); async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(user)});
    if(res.ok) r.push('/dashboard'); else setErr((await res.json()).error);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={submit} className="p-6 bg-gray-800 rounded-xl space-y-4">
        <h1 className="text-xl text-white">Login</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input type="text" placeholder="Username" value={user.username} onChange={e=>setUser({...user,username:e.target.value})} className="w-full p-2 rounded" />
        <input type="password" placeholder="Password" value={user.password} onChange={e=>setUser({...user,password:e.target.value})} className="w-full p-2 rounded" />
        <button type="submit" className="w-full p-2 bg-gray-700 rounded text-white">Login 😭</button>
      </form>
    </div>
  );
}

// pages/dashboard.js
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
  const r = useRouter();
  useEffect(()=>{
    fetch('/api/users').then(r=>r.json()).then(d=>setUsers(d.users));
  },[]);
  function logout(){ document.cookie = 'username=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; r.push('/login'); }
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex justify-between items-center text-white">
        <h1>Welcome, {username} 😭</h1>
        <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded">Logout</button>
      </div>
      <div className="mt-6 bg-gray-800 p-4 rounded h-64 overflow-y-scroll text-white">
        {users.map(u=><p key={u}>{u}</p>)}
      </div>
    </div>
  );
}
