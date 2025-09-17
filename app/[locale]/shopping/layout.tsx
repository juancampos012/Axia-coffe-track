import HomeBox from "@/components/organisms/HomeBox";

export default function Shoppinglayout({
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
  