import { GetServerSideProps } from "next";

export const GetLoggedInProp: GetServerSideProps = async (context) => {
    const { req } = context;
    const cookies = req.headers.cookie?.split('; ') || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('session='))?.substring(8);
    if(!sessionCookie) return { props: { loggedIn: false } }

    const response = await fetch(`${process.env.SERVER_URL}/api/v1/user`, {
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