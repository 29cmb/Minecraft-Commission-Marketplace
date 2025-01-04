'use client'

import { useRouter } from "next/navigation";

export default function Topbar({ loggedIn }: { loggedIn: boolean }) {
    const router = useRouter();
    return (
        <div className="w-screen h-[80px] bg-[#050505] flex items-center justify-between fixed z-10">
            <div className="ml-[20px]">
                <h1 className="font-inter font-bold text-[30px]">Minecraft Commission Marketplace</h1>
            </div>
            <div className="mr-[40px]"> 
                <button className="font-inter py-[5px] text-[25px] font-semibold transform transition-transform duration-200 ease-in-out hover:scale-110 mx-10" onClick={
                    () => {
                        router.push('/forms')
                    }
                }>Forms</button>
                {!loggedIn && <button className="bg-[#36BE5A] rounded-[1em] px-[30px] py-[5px] font-inter text-[20px] font-semibold transform transition-transform duration-200 ease-in-out hover:scale-110" onClick={() => {
                    router.push('/login')
                }}>Log in</button>}
            </div>
        </div>
    )
}