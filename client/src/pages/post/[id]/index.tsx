import Post from "@/components/Post";
import "@/styles/globals.css";
import { PostResponseSuccess, RequestFail } from "@/Types";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";

export default function PostPage({ categories }: { categories: PostResponseSuccess | RequestFail }) {
    if(categories.success == false){
        return <></>
    }

    return <>
        <div className="p-[30px] m-[30px]">
            <Post
                title={categories.post.title}
                short_description={categories.post.short_description}
                tags={categories.post.tags}
                post_category={categories.post.post_category}
                author_name={categories.post.author_name}
                post_date={categories.post.$createdAt}
                id={categories.post.$id}
                onPostPage={true}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as Params;

    const res = await fetch(`${process.env.SERVER_URL}/api/v1/post/${id}`);
    const categories: PostResponseSuccess | RequestFail = await res.json();

    return {
        props: {
            categories,
        },
    };
};