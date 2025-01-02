import Category from "@/components/Category"
import "@/styles/globals.css"
export default function Forms(){
    return (
        <>
            <h1 className="text-center font-inter font-bold text-[80px] mt-[40px]">Commission Forms</h1>
            <div className="w-screen h-auto m-0 align-center justify-center flex flex-wrap mt-[100px] gap-4">
                <Category name="Mods" subcategories={5} posts={100} ctype={0} />
                <Category name="Plugins" subcategories={5} posts={100} ctype={0} />
            </div>
        </>
    )
}