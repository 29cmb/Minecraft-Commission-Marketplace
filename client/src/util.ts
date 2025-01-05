import { GetServerSideProps } from "next";

export const GetLoggedInProp: GetServerSideProps = async (context) => {
    const { req } = context;
    const cookies = req.headers.cookie?.split('; ') || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='))?.substring(8);
    const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
            "Authorization": sessionCookie || ""
        }
    });
    const data = await response.json();

    return {
        props: {
            loggedIn: data.success
        }
    };
};