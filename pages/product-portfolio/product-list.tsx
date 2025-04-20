import { getSession } from "next-auth/react";
import ProductList from "@/components/product-portfolio/product-list";

import { Session } from "next-auth";

export default function ProductListPage({ session }: { session: Session | null }) {
  if (!session) {
    return <div>You need to be authenticated to view this page.</div>;
  }

  return <ProductList />;
}

import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}