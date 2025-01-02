import { useRouter } from 'next/router';
import "@/styles/globals.css";

export default function Subcategory() {
  const router = useRouter();
  const { category, subcategory } = router.query;

  const CapitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">
        {category ? CapitalizeFirstLetter(subcategory as string) : 'Loading...'}
      </h1>
    </>
  );
}