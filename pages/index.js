// pages/index.js

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/landing.html',
      permanent: false, // Set to true if you want a permanent redirect
    },
  };
}

export default function Home() {
  return null; // This component won't render because of the redirect
}
