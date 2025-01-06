'use client';

import { PostProps } from "@/Types";
import { format, isToday, isYesterday } from 'date-fns';
import { useRouter } from "next/router";
import { useState } from "react";

const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
};

const colors: { [key: string]: string } = {
    announcement: "#E31010",
    request: "#1084E3",
    forhire: "#10E337"
}

const literals: {[key: string]: string} = {
    announcement: "Announcement",
    request: "Hiring",
    forhire: "For Hire"
}

const easterEggClicks: string[] = [
    "What are you clicking for?",
    "Do you want something from me?",
    "Stop clicking!",
    "Thats getting annoying.",
    "You're not getting free assets, stop asking.",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "Nibbl_z is going to be mad at you.",
    "Why. Are. You. So. CLICKY!",
    "Buddy.",
    "Let me sleep!",
    "I'm not a button!"
]

export default function Post({ title, short_description, tags, post_category, author_name, post_date, id, onPostPage, approved, session }: PostProps) {
    const date = new Date(post_date);
    let formattedDate;

    if (isToday(date)) {
        formattedDate = `Today at ${formatTime(date)}`;
    } else if (isYesterday(date)) {
        formattedDate = `Yesterday at ${formatTime(date)}`;
    } else {
        formattedDate = format(date, 'MM/dd/yy');
    }

    const router = useRouter();
    const [clicks, setClicks] = useState(0);
    
    return (
        <div style={{ backgroundColor: approved == false ? "rgb(27,110,48)" : "#111111"}} className="h-[130px] flex mx-auto rounded-[2em] relative mb-[10px] hover:scale-105 active:scale-[1.02] transition-all duration-200 ease-in-out hover:bg-[#1f1f1f]"
            onClick={() => {
                if(!onPostPage) return router.push(`/post/${id}`)
                setClicks(clicks + 1);
                if(clicks % 60 == 39) {
                    alert(easterEggClicks[Math.floor(Math.random() * easterEggClicks.length)]);
                }
            }}
        >
            <div className="absolute m-[20px]">
                <div style={{ backgroundColor: colors[post_category] }} className="w-[15px] h-[15px] rounded-sm"></div>
                <p className="absolute top-[-4px] left-[20px] w-screen font-inter font-bold">{literals[post_category]} • <span style={{ color: approved == false ? "white" : "#565656" }} className="text-[#565656]">{formattedDate}</span></p>
            </div>
            <h1 className="text-white font-inter font-bold text-[32px] leading-[100%] p-[20px] top-[20px] absolute">{title} {!onPostPage && <span style={{ color: approved == false ? "#eeeeee" : "#424242" }} className="font-inter font-extrabold text-[20px]">{author_name}</span>}</h1>
            <p className="text-white font-inter text-[20px] leading-[100%] p-[20px] top-[50px] absolute font-light"><i>{short_description}</i></p>
            <div className="absolute w-[100%] h-[40px] bottom-1 flex mx-[15px]">
                {tags.map((tag, index) => (
                    <p key={index} className="leading-[100%] px-[13px] py-[1px] bg-[#363636] my-[10px] mx-[2px] font-black font-inter text-[#A4A4A4] rounded-full">{tag}</p>
                ))}
            </div>
            {
                onPostPage && <div className="absolute right-0 top-50% translate-y-[25%] m-4 leading-[200%]">
                    <p className="text-right font-inter font-extrabold text-[30px]">Posted by</p>
                    <p className="text-right font-inter font-extrabold text-[30px] text-[#969696]">{author_name}</p>
                </div>
            }
            {
                onPostPage && !approved && session && <div className="absolute bottom-0 right-0 m-2 mx-6">
                    <button className="mx-1 bg-[#409426] px-[10px] rounded-xl" onClick={() => {
                        fetch(`/api/v1/approve`, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': session || ""
                            },
                            body: JSON.stringify({
                                id
                            })
                        }).then(j => j.json()).then((data) => {
                            if(data.success) {
                                alert("Post approved!");
                                router.reload();
                            } else {
                                alert("Failed to approve post!");
                            }
                        })
                    }}>Accept</button>
                    <button className="mx-1 bg-[#ff2200] px-[13px] rounded-xl" onClick={() => {
                        fetch(`/api/v1/posts/${id}/deny`, {
                            method: "POST"
                        }).then(() => {
                            alert("Post denied!");
                            router.push("/");
                        })
                    }}>Deny</button>
                </div>
            }
        </div>
    );
}