import React, { ReactNode } from "react";

interface Input {
    id: string;
    type: string;
    placeholder: string;
}

interface FormProps {
    inputs: Input[];
    subtext: ReactNode;
    buttonData: [string, (noteElement: HTMLElement, ...values: string[]) => void];
}

const Form: React.FC<FormProps> = ({ inputs, subtext, buttonData }) => {
    const submit = () => {
        const values = inputs.map(input => (document.getElementById(input.id) as HTMLInputElement).value);
        const noteElement = document.getElementById("note") as HTMLElement;
        buttonData[1](noteElement, ...values);
    };

    return (
        <div className="bg-[#141414] w-[550px] h-[560px] rounded-[40px] mx-auto py-[40px] relative flex flex-col items-center">
            {inputs.map((input, index) => (
                <div key={index} className="w-full flex justify-center">
                    <input
                        id={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        className="bg-[#1f1f1f] border-none rounded-[10px] m-[5px] h-[80%] p-[20px] text-white w-[90%] text-[40px]"
                    />
                </div>
            ))}
            <p className="text-white text-center">{subtext}</p>
            <p id="note" className="text-center font-inter font-bold text-[20px] leading-[100%] mt-[20px]" />
            <button
                onClick={submit}
                className="bg-green-600 text-white border-none rounded-[15px] absolute bottom-[20px] w-[90%] h-[70px] text-[40px] transition-all duration-200 ease-in-out hover:text-[45px] hover:h-[75px] hover:w-[92%] active:bg-green-700"
            >
                {buttonData[0]}
            </button>
        </div>
    );
};

export default Form;