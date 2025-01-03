'use client';

import { PostProps } from "@/Types";
import { format, isToday, isYesterday } from 'date-fns';

const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
};

export default function Post({ title, short_description, tags, post_category, post_color, author_name, post_date }: PostProps) {
    const date = new Date(post_date);
    let formattedDate;

    if (isToday(date)) {
        formattedDate = `Today at ${formatTime(date)}`;
    } else if (isYesterday(date)) {
        formattedDate = `Yesterday at ${formatTime(date)}`;
    } else {
        formattedDate = format(date, 'MM/dd/yy');
    }

    return (
        <div className="h-[130px] bg-[#111111] flex mx-auto rounded-[2em] relative">
            <div className="absolute m-[20px]">
                <div style={{ backgroundColor: post_color }} className="w-[15px] h-[15px] rounded-sm"></div>
                <p className="absolute top-[-4px] left-[20px] w-screen font-inter font-bold">{post_category} • <span className="text-[#565656]">{formattedDate}</span></p>
            </div>
            <h1 className="text-white font-inter font-bold text-[32px] leading-[100%] p-[20px] top-[20px] absolute">{title} <span className="text-[#424242] font-inter font-extrabold text-[20px]">{author_name}</span></h1>
            <p className="text-white font-inter text-[20px] leading-[100%] p-[20px] top-[50px] absolute font-light"><i>{short_description}</i></p>
            <div className="absolute w-[100%] h-[40px] bottom-1 flex mx-[15px]">
                {tags.map((tag, index) => (
                    <p key={index} className="leading-[100%] px-[13px] py-[1px] bg-[#363636] my-[10px] mx-[2px] font-black font-inter text-[#A4A4A4] rounded-full">{tag}</p>
                ))}
            </div>
        </div>
    );
}