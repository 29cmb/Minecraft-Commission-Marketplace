import Category from "@/components/Category";
import "@/styles/globals.css";
import { CategoriesResponseSuccess, RequestFail } from "@/Types";
import { GetServerSideProps } from 'next';

export default function Forms({ categories }: { categories: CategoriesResponseSuccess | RequestFail }) {
  if (!categories.success) {
    return <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">Failed to load categories</h1>;
  }

  return (
    <>
      <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">Commission Forms</h1>
      <div className="w-screen h-auto m-0 align-center justify-center flex flex-wrap mt-[100px] gap-4">
        {categories.categories.map((category, index) => (
          <Category key={index} name={category.name} subcategories={category.subcategoriesCount} posts={category.postsCount} ctype={0} />
        ))}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.SERVER_URL}/api/v1/categories`);
  const categories: CategoriesResponseSuccess | RequestFail = await res.json();

  return {
    props: {
      categories,
    },
  };
};