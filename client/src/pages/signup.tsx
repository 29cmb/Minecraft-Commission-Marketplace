'use client'
import Form from "@/components/Form"
import Topbar from "@/components/Topbar"
import "@/styles/globals.css"
import { GetLoggedInProp } from "@/util"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Signup({ loggedIn }: { loggedIn: boolean }) {
    const router = useRouter();
    
    useEffect(() => {
        if (loggedIn) {
            router.push("/forms");
        }
    }, [loggedIn, router]);

    if(loggedIn){
        return null
    }

    return (
        <>
           <Topbar loggedIn={false}/>
            <h1 className="text-center text-[40px] font-inter font-bold pt-[150px]">Sign up</h1>
            <Form
                inputs={[
                    {id: "email", type: "text", placeholder: "Email"},
                    {id: "username", type: "text", placeholder: "Username"},
                    {id: "password", type: "password", placeholder: "Password"}
                ]}
                subtext={<span className="font-inter text-[30px] leading-[120%]">Already have an account?<br/>Log in <Link href="/login"><u className="text-[#54bbff]">here!</u></Link></span>}
                buttonData={["Signup", (note, email, username, password) => {
                    fetch("/api/v1/signup", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({email, username, password})
                    }).then(data => data.json()).then(async data => {
                        if(data.success){
                            note.innerHTML = `<span style="color:lime">${data.message}</span>`;
                            router.push("/login");
                        } else {
                            note.innerHTML = `<span style="color:red">${data.message}</span>`;
                        }
                    });
                }]}
             />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = GetLoggedInProp;