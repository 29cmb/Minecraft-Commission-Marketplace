'use client'
import { CategoryProps } from "@/Types"
import { useRouter } from "next/router"

export default function Category({ name, subcategories, posts, ctype, category }: CategoryProps) {
    const router = useRouter()

    if (ctype == 1 && category == null) {
        throw new Error("Category prop is required when ctype is 1")
    }

    return (
        <div className="w-[500px] h-[310px] bg-[#151515] rounded-[20px] m-[10px] flex flex-col items-center justify-center">
            <h1 className="font-inter text-[80px] font-semibold m-[20px] mt-[-20px]">{name}</h1>
            {ctype == 0 && (<p className="font-inter font-medium text-[30px] m-[20px] mt-[-40px]"><b>{subcategories}</b> subcategories available</p>)}
            <p className="font-inter font-medium text-[30px] m-[20px] mt-[-30px]"><b>{posts}</b> posts</p>
            <button className="inline-flex items-center justify-center text-center w-[90%] font-inter text-white text-[40px] bg-[#36BE5A] py-[15px] px-[40px] leading-none rounded-xl transform transition-transform duration-200 ease-in-out hover:scale-110" onClick={
                () => {
                    let redirect;
                    if(ctype == 0){
                        redirect = '/forms/' + name.toLowerCase()
                    } else if(ctype == 1){
                        redirect = '/forms/' + category?.toLowerCase() + '/' + name.toLowerCase()
                    } else {
                        redirect = '/forms'
                    }

                    router.push(redirect)
                }
            }>Enter</button>
        </div>
    )
}