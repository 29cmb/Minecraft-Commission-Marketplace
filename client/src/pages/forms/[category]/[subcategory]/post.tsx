'use client'
import Topbar from "@/components/Topbar";
import "@/styles/globals.css";
import { GetLoggedInProp } from "@/util";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useState } from "react";

interface PostProps {
  category: string;
  subcategory: string;
  loggedIn: boolean;
  isStaff: boolean,
  auth: string
}

const literals: {[key: string]: string} = {
    Announcement: "announcement",
    Hiring: "request",
    ["For Hire"]: "forhire"
}

export default function Post({ subcategory, loggedIn, isStaff, auth }: PostProps) {
    const router = useRouter();
    useEffect(() => {
        if(!loggedIn) {
            router.push('/login')
        }
    }, [loggedIn, router])

    const [postData, setPostData] = useState({
        title: null as string | null,
        short_description: null as string | null,
        long_description: null as string | null,
        comments_enabled: true,
        postTags: [] as string[],
        post_category: "request",
        discord_contact: null as string | null,
        subcategory
    });

    const [note, setNote] = useState({text: "", success: true})

    if(!loggedIn) return <></>
    return (
        <>
            <Topbar loggedIn={true}/>
            <h1 className="text-center text-[60px] pt-[100px] font-inter font-bold">Post to {subcategory}</h1>
            <div className="mt-[20px] min-w-[400px] max-w-[900px] bg-[#141414] rounded-xl mx-auto mb-[30px]">
                <div className="flex-col justify-center p-[30px] pb-[20px] space-y-[20px]">
                    <div className="relative">
                        <input type="text" onChange={(event) => {
                            setPostData({...postData, title: event.target.value.length == 0 ? null : event.target.value})
                        }} placeholder="Post name*" required maxLength={40} className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[40px] pr-5"></input>
                        <p className="absolute bottom-2 right-2 font-inter font-bold">{postData.title?.length}/40</p>
                    </div>
                    <div className="relative">
                        <input type="text" onChange={(event) => {
                            setPostData({...postData, short_description: event.target.value.length == 0 ? null : event.target.value})
                        }} placeholder="Short description*" required maxLength={80} className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[40px] pr-5"></input>
                        <p className="absolute bottom-2 right-2 font-inter font-bold">{postData.short_description?.length}/80</p>
                    </div>
                    <div className="relative">
                        <textarea placeholder="Long description*" onChange={(event) => {
                            setPostData({...postData, long_description: event.target.value.length == 0 ? null : event.target.value})
                        }} maxLength={4000} required className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[20px] pr-5"></textarea>
                        <p className="absolute bottom-2 right-2 font-inter font-bold">{postData.long_description?.length}/4000</p>
                    </div>
                    <div className="relative">
                        <input type="text" onChange={(event) => {
                            const tags: string[] = event.target.value.replace(" ", "").split(',')
                            setPostData({...postData, postTags: tags})
                        }} placeholder="Tags (seperate with commas)" required maxLength={200} className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[40px] pr-5"></input>
                    </div>
                    <div className="relative">
                        <select onChange={(event) => {
                            setPostData({...postData, post_category: literals[event.target.value]})
                        }} required className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[40px] pr-5">
                            <option>Hiring</option>
                            <option>For Hire</option>
                            {isStaff && <option>Announcement</option>}
                        </select>
                    </div>
                    <div className="relative">
                        <input type="text" onChange={(event) => {
                            setPostData({...postData, discord_contact: event.target.value.length == 0 ? null : event.target.value})
                        }} placeholder="Discord*" required maxLength={200} className="bg-[#1f1f1f] border-none rounded-[10px] h-[80%] p-[20px] text-white w-full text-[40px] pr-5"></input>
                        <p className="absolute bottom-2 right-2 font-inter font-bold">{postData.discord_contact?.length || 0}/200</p>
                    </div>
                    <p style={{ color: note.success ? "#00ff00" : "#ff0000" }} className="text-center font-inter font-bold text-[20px]">{note.text}</p>
                    <button onClick={() => {
                        fetch(`/api/v1/post`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': auth
                            },
                            body: JSON.stringify(postData)
                        }).then(j => j.json()).then((response) => {
                            setNote({text: response.message, success: response.success})
                        })
                    }} className="inline-flex items-center justify-center text-center font-inter text-white text-[40px] bg-[#36BE5A] w-[100%] p-[10px] leading-none rounded-xl transform transition-transform duration-200 ease-in-out hover:scale-110">Post</button>
                </div>
            </div>
        </>
    );
}

interface Params extends ParsedUrlQuery {
    subcategory: string;
}

interface LoggedInProps extends GetServerSideProps {
    props: {loggedIn: boolean};
}  

export const getServerSideProps: GetServerSideProps = async (context) => {
    const params = context.params as Params;

    const loggedInResult = await GetLoggedInProp(context) as unknown as LoggedInProps;
    const { loggedIn } = loggedInResult.props;

    const { req } = context;
    const cookies = req.headers.cookie?.split('; ') || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='))?.substring(8);

    const isStaff = await fetch(`${process.env.SERVER_URL}/api/v1/staff`, {
        headers: {
            ["Authorization"]: sessionCookie || ""
        }
    }).then(r => r.json()).then(d => d.staff)

    return {
        props: {
            subcategory: params?.subcategory || '',
            loggedIn,
            isStaff,
            auth: sessionCookie || null
        },
    };
};