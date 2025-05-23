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
