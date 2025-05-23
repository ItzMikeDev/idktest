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
