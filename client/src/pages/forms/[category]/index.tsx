import { useRouter } from 'next/router';
import "@/styles/globals.css";
import Category from '@/components/Category';

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">
        {category ? capitalizeFirstLetter(category as string) : 'Loading...'}
      </h1>
      <div className="w-screen h-auto m-0 align-center justify-center flex flex-wrap mt-[100px] gap-4">
        <Category name="Spigot" subcategories={5} posts={100} ctype={1} category={(category || "Loading") as string} />
        <Category name="Paper" subcategories={5} posts={100} ctype={1} category={(category || "Loading") as string}/>
        <Category name="Server" subcategories={5} posts={100} ctype={1} category={(category || "Loading") as string}/>
        <Category name="Velocity" subcategories={5} posts={100} ctype={1} category={(category || "Loading") as string}/>
        <Category name="Config" subcategories={5} posts={100} ctype={1} category={(category || "Loading") as string}/>
      </div>
    </>
  );
}