import { useRouter } from 'next/router';
import "@/styles/globals.css";
import Post from '@/components/Post';

export default function Subcategory() {
  const router = useRouter();
  const { category, subcategory } = router.query;

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  console.log(category, subcategory)

  return (
    <>
      <h1 className="text-center font-inter font-bold text-[70px] mt-[40px]">
        {subcategory ? capitalizeFirstLetter(subcategory as string) : 'Loading...'}
      </h1>
      <div className="flex justify-center">
        <button className="inline-flex items-center justify-center text-center font-inter text-white text-[30px] bg-[#36BE5A] py-[10px] px-[400px] leading-none rounded-xl transform transition-transform duration-200 ease-in-out hover:scale-110">
          Post
        </button>
      </div>
      <div className="p-[20px]">
        <Post 
          title='This a test' 
          short_description='A simple test of the post thing' 
          tags={["test", "test1", "test2", "test3"]} 
          post_category='Announcement'
          post_color='#E31010'
          author_name='devcmb'
          post_date='2025-01-01T05:00:00.000Z'
        />
      </div>
    </>
  );
}