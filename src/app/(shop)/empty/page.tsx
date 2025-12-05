import Link from "next/link";
import { IoCartOutline } from "react-icons/io5";

export default function EmptyPage() {
  return (
    <div className="flex justify-center items-center h-[800px]">
      <IoCartOutline size={80} className="mx-5" />

      <div className="flex flex-col items-center">
        <h1 className="text-xl font-extrabold">Tu carrito esta Vacio</h1>

        <Link href="/" className="text-fuchsia-500 text-4xl">
          {" "}
          Regresar
        </Link>
      </div>
    </div>
  );
}
