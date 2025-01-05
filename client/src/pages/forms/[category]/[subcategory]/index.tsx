import "@/styles/globals.css";
import Post from '@/components/Post';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { PostsReponseSuccess } from '@/Types';
import { GetLoggedInProp } from "@/util";
import Topbar from "@/components/Topbar";
import Pagination from "@/components/Pagination";
export default function Subcategory({ subcategory, postsResponse, loggedIn, activePage, totalPages }: { subcategory: string, postsResponse: PostsReponseSuccess, loggedIn: boolean, activePage: number, totalPages: number }) {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if(!postsResponse || !postsResponse.posts) return <></>
  return (
    <>
      <Topbar loggedIn={loggedIn} />
      <h1 className="text-center font-inter font-bold text-[70px] pt-[90px]">
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
      <Pagination currentPage={activePage} totalPages={totalPages}/>
    </>
  );
}

interface Params extends ParsedUrlQuery {
  category: string;
  subcategory: string;
}

interface LoggedInProps extends GetServerSideProps {
  props: {loggedIn: boolean};
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category, subcategory } = context.params as Params;
  const page = parseInt(context.query.page as string) || 1;

  let totalPages = await fetch(`${process.env.SERVER_URL}/api/v1/pages/${subcategory}`).then(res => res.json()).then(data => data.pages);
  if(!totalPages) totalPages = 1;

  const res = await fetch(`${process.env.SERVER_URL}/api/v1/${subcategory}/posts?page=${Math.min(page, totalPages)}`);
  const data = await res.json();

  const loggedInResult = await GetLoggedInProp(context) as unknown as LoggedInProps;
  const { loggedIn } = loggedInResult.props;

  return {
    props: {
      category,
      subcategory,
      postsResponse: data,
      loggedIn,
      activePage: Math.min(page, totalPages),
      totalPages
    },
  };
}