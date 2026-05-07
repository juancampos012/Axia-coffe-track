import HomeBox from "@/components/organisms/HomeBox";

export default function Saleslayout({
    children
}: {
    children: React.ReactNode;
}){
    return (
        <main className="justify-center items-center bg-black">
            <HomeBox>
                {children}
            </HomeBox>
        </main>
    );
}  
  