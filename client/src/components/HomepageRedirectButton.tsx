'use client';
export default function HomepageRedirectButton() {
    return (
        <div className="flex justify-center mt-10">
            <button
                className="inline-flex items-center justify-center text-center font-inter text-white text-[40px] bg-[#36BE5A] py-[15px] px-[200px] leading-none rounded-xl transform transition-transform duration-200 ease-in-out hover:scale-110"
                onClick={() => {
                    window.location.href = "/forms";
                }}
            >
                Head to the forms
            </button>
        </div>
    );
}