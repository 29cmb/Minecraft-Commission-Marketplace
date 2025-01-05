import Category from "@/components/Category";
import "@/styles/globals.css";
import { GetServerSideProps } from 'next';
import { PostsReponseSuccess, RequestFail, SubcategoriesResponseSuccess } from '@/Types';
import { GetLoggedInProp } from "@/util";
import Topbar from "@/components/Topbar";

export default function Forms({ subcategoryRequest, loggedIn }: { subcategoryRequest: SubcategoriesResponseSuccess | RequestFail, loggedIn: boolean }) {
  if (!subcategoryRequest.success) {
    return <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">Failed to load subcategories</h1>;
  }

  return (
    <>
      <Topbar loggedIn={loggedIn} />
      <h1 className="text-center font-inter font-bold text-[80px] pt-[100px]">Commission Forms</h1>
      <div className="w-screen h-auto m-0 align-center justify-center flex flex-wrap mt-[20px] gap-4">
        {subcategoryRequest.subcategories.documents.map((subcategory, index) => (
          <Category key={index} name={subcategory.name} subcategories={0} posts={subcategory.postsCount} ctype={1} category={subcategory.category} />
        ))}
      </div>
    </>
  );
}

interface LoggedInProps extends GetServerSideProps {
  props: {loggedIn: boolean};
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`${process.env.SERVER_URL}/api/v1/subcategories`);
  const subcategoryRequest: SubcategoriesResponseSuccess | RequestFail = await res.json();

  if (!subcategoryRequest.success || !Array.isArray(subcategoryRequest.subcategories.documents)) {
    return {
      props: {
        subcategoryRequest: {
          success: false,
          message: 'Failed to load subcategories',
        },
      },
    };
  }

  for (const sub of subcategoryRequest.subcategories.documents) {
    const postsInSub: PostsReponseSuccess | RequestFail = await (await fetch(`${process.env.SERVER_URL}/api/v1/${sub.name}/posts`)).json();
    if (postsInSub.success) {
      sub.postsCount = postsInSub.posts.total;
    }
  }

  const loggedInResult = await GetLoggedInProp(context) as unknown as LoggedInProps;
  const { loggedIn } = loggedInResult.props;

  return {
    props: {
      subcategoryRequest,
      loggedIn
    },
  };
};