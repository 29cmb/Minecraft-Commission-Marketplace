'use client'
import { useRouter } from 'next/router';

export default function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
    const router = useRouter();

    const handlePageChange = (newPage: number) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage }
        });
    };

    return (
        <div className="flex justify-center mb-[20px]">
            {currentPage > 1 && (
                <button
                    className="w-[50px] h-[50px] leading-[0%] font-inter font-bold text-[30px] rounded-xl"
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    {currentPage - 1}
                </button>
            )}
            <button className="bg-[#20A9FF] w-[50px] h-[50px] leading-[0%] font-inter font-bold text-[30px] rounded-xl">
                {currentPage}
            </button>
            {currentPage < totalPages && (
                <button
                    className="w-[50px] h-[50px] leading-[0%] font-inter font-bold text-[30px] rounded-xl"
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    {currentPage + 1}
                </button>
            )}
        </div>
    );
}