import HomepageRedirectButton from "@/components/HomepageRedirectButton";
import { PostsReponseSuccess, RequestFail } from "@/Types";

export default async function Home() {
  const postsInPlugins: PostsReponseSuccess | RequestFail = await fetch(`${process.env.SERVER_URL}/api/v1/posts/category/plugins`).then(res => res.json());
  const totalPostsInCategory: number = postsInPlugins.success ? postsInPlugins.posts.total : 0

  const postsInPaper: PostsReponseSuccess | RequestFail = await fetch(`${process.env.SERVER_URL}/api/v1/Paper/posts`).then(res => res.json());
  const totalPostsInPaper: number = postsInPaper.success ? postsInPaper.posts.total : 0

  const postsInSpigot: PostsReponseSuccess | RequestFail = await fetch(`${process.env.SERVER_URL}/api/v1/Spigot/posts`).then(res => res.json());
  const totalPostsInSpigot: number = postsInSpigot.success ? postsInSpigot.posts.total : 0

  return (
    <>
      <div className="bg-[#25262B] w-screen h-[30em] flex items-center justify-center">
        <h1 className="text-white text-[80px] font-bold text-center pt-10 leading-[100%] pb-20">
          The easiest way to get<br/>
          <span className="bg-gradient-to-b from-[#A100FF] to-[#450099] bg-clip-text text-transparent font-inter font-black relative top-[5px]">
            Minecraft Development
          </span>
          <br/>commissions
        </h1>
      </div>
      <div className="w-screen">
        <div className="flex space-x-8 mt-[100px] justify-center">
          <div className="w-[400px] h-[250px] bg-black rounded-[2rem] flex items-center justify-center">
            <h1 className="text-center text-white font-inter font-bold text-[50px] leading-[100%]">Verified<br/>Sellers</h1>
          </div>
          <div className="w-[400px] h-[250px] bg-black rounded-[2rem] flex items-center justify-center">
            <h1 className="text-center text-white font-inter font-bold text-[50px] leading-[100%]">Efficient<br/>Staff</h1>
          </div>
          <div className="w-[400px] h-[250px] bg-black rounded-[2rem] flex items-center justify-center">
            <h1 className="text-center text-white font-inter font-bold text-[50px] leading-[100%]">Open to<br/>Everyone</h1>
          </div>
        </div>
        <div className="w-screen h-[2px] bg-[#353535] mt-[100px] mb-[100px]"></div>
        <div className="w-screen h-[50em] leading-[680%]">
          <h1 className="text-center text-white font-inter font-bold text-[100px]"><span className="text-[120px] bg-gradient-to-b from-[#EB3971] to-[#CC1D43] bg-clip-text text-transparent relative top-5">{totalPostsInCategory}</span> posts in the Plugins Category</h1>
          <h2 className="text-center text-white font-inter font-bold text-[80px]"><span className="text-[120px] bg-gradient-to-b from-[#4EEB39] to-[#1DCC60] bg-clip-text text-transparent relative top-5">{totalPostsInPaper}</span> posts in the Paper subcategory</h2>
          <h2 className="text-center text-white font-inter font-bold text-[80px]"><span className="text-[120px] bg-gradient-to-b from-[#EBDC39] to-[#CC9D1D] bg-clip-text text-transparent relative top-5">{totalPostsInSpigot}</span> posts in Spigot subcategory</h2>
          <p className="text-center text-white font-inter font-semibold text-[40px]">So what are you waiting for?</p>
          <HomepageRedirectButton/>
        </div>
      </div>
    </>
  );
}