import Form from "@/components/Form"
import Topbar from "@/components/Topbar"
import "@/styles/globals.css"

export default function Login() {
    return (
        <>
            <Topbar loggedIn={false}/> {/* TODO */}
            <h1 className="text-center text-[40px] font-inter font-bold pt-[150px]">Log in</h1>
            <Form
                inputs={[
                    {id: "username", type: "text", placeholder: "Username"},
                    {id: "password", type: "password", placeholder: "Password"}
                ]}
                subtext={<span className="font-inter text-[30px] leading-[120%]">Don&apos;t have an account?<br/>Sign up <a href="/signup"><u className="text-[#54bbff]">here!</u></a></span>}
                buttonData={["Login", (/**note, username, password*/) => {
                    
                }]}
             />
        </>
    )
}