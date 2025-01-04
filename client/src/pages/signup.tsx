import Form from "@/components/Form"
import Topbar from "@/components/Topbar"
import "@/styles/globals.css"

export default function Signup() {
    return (
        <>
           <Topbar loggedIn={false}/> {/* TODO */}
            <h1 className="text-center text-[40px] font-inter font-bold pt-[150px]">Sign up</h1>
            <Form
                inputs={[
                    {id: "email", type: "text", placeholder: "Email"},
                    {id: "username", type: "text", placeholder: "Username"},
                    {id: "password", type: "password", placeholder: "Password"}
                ]}
                subtext={<span className="font-inter text-[30px] leading-[120%]">Already have an account?<br/>Log in <a href="/login"><u className="text-[#54bbff]">here!</u></a></span>}
                buttonData={["Signup", (/**note, email, username, password*/) => {
                    
                }]}
             />
        </>
    )
}