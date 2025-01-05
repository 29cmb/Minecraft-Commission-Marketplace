import Form from "@/components/Form";
import Topbar from "@/components/Topbar";
import "@/styles/globals.css";
import { GetLoggedInProp } from "@/util";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login({ loggedIn }: { loggedIn: boolean }) {
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
            <Topbar loggedIn={false} />
            <h1 className="text-center text-[40px] font-inter font-bold pt-[150px]">Log in</h1>
            <Form
                inputs={[
                    { id: "username", type: "text", placeholder: "Username" },
                    { id: "password", type: "password", placeholder: "Password" }
                ]}
                subtext={<span className="font-inter text-[30px] leading-[120%]">Don&apos;t have an account?<br />Sign up <Link href="/signup"><u className="text-[#54bbff]">here!</u></Link></span>}
                buttonData={["Login", (note, username, password) => {
                    fetch("/api/v1/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password })
                    }).then(data => data.json()).then(async data => {
                        if (data.success) {
                            document.cookie = `session=${data.secret}; path=/; max-age=${30 * 24 * 60 * 60};`;
                            note.innerHTML = `<span style="color:lime">${data.message}</span>`;
                            router.push("/forms");
                        } else {
                            note.innerHTML = `<span style="color:red">${data.message}</span>`;
                        }
                    });
                }]}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = GetLoggedInProp;