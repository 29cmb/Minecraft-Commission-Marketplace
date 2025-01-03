import "@/styles/globals.css";
import Post from '@/components/Post';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { PostsReponseSuccess } from '@/Types';
export default function Subcategory({ subcategory, postsResponse }: { subcategory: string, postsResponse: PostsReponseSuccess }) {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if(!postsResponse || !postsResponse.posts) return <></>

  return (
    <>
      <h1 className="text-center font-inter font-bold text-[70px] mt-[40px]">
        {subcategory ? capitalizeFirstLetter(subcategory as string) : 'Loading...'}
      </h1>
      <div className="flex justify-center">
        <button className="inline-flex items-center justify-center text-center font-inter text-white text-[30px] bg-[#36BE5A] py-[10px] w-[calc(100vw-400px)] leading-none rounded-xl transform transition-transform duration-200 ease-in-out hover:scale-110">
          Post
        </button>
      </div>
      <div className="p-[20px] px-[200px]">
        {postsResponse.success && postsResponse.posts.documents.map((post, index) => (
          <Post 
            title={post.title} 
            short_description={post.short_description} 
            tags={post.tags} 
            post_category={post.post_category}
            author_name={post.author_name}
            post_date={post.$createdAt}
            id={post.$id}
            key={index}
            onPostPage={false}
          />
        ))}
      </div>
    </>
  );
}

interface Params extends ParsedUrlQuery {
  category: string;
  subcategory: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category, subcategory } = context.params as Params;

  const res = await fetch(`${process.env.CLIENT_URL}/api/v1/${subcategory}/posts`);
  const data = await res.json();

  return {
    props: {
      category,
      subcategory,
      postsResponse: data,
    },
  };
}