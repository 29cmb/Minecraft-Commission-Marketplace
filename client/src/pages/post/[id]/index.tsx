import Post from "@/components/Post";
import Topbar from "@/components/Topbar";
import "@/styles/globals.css";
import { PostResponseSuccess, RequestFail } from "@/Types";
import { GetLoggedInProp } from "@/util";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";

export default function PostPage({ categories, loggedIn, session }: { categories: PostResponseSuccess | RequestFail, loggedIn: boolean, session: string }) {
    if(categories.success == false){
        return <></>
    }

    return <>
        <Topbar loggedIn={loggedIn} />
        <div className="p-[30px] mx-[30px] pt-[120px]">
            <Post
                title={categories.post.title}
                short_description={categories.post.short_description}
                tags={categories.post.tags}
                post_category={categories.post.post_category}
                author_name={categories.post.author_name}
                post_date={categories.post.$createdAt}
                id={categories.post.$id}
                onPostPage={true}
                approved={categories.post.approved}
                session={session}
            ></Post>
            <div className="mt-[30px] min-h-[300px] bg-[#111111] flex mx-auto rounded-[2em] relative mb-[10px]">
                <p className="p-[20px]">
                    {categories.post.long_description.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </p>
            </div>
        </div>
    </>
}

interface Params extends ParsedUrlQuery {
  id: string;
}

interface LoggedInProps extends GetServerSideProps {
    props: {loggedIn: boolean};
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as Params;

    const res = await fetch(`${process.env.SERVER_URL}/api/v1/post/${id}`);
    const categories: PostResponseSuccess | RequestFail = await res.json();
    const loggedInResult = await GetLoggedInProp(context) as unknown as LoggedInProps;
    const { loggedIn } = loggedInResult.props;

    const { req } = context;
    const cookies = req.headers.cookie?.split('; ') || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='))?.substring(8);

    return {
        props: {
            categories,
            loggedIn,
            session: sessionCookie
        },
    };
};