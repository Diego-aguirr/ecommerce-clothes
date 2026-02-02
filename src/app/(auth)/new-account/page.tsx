import { titleFont } from "@/config/fonts";
import { FormRegister } from "./ui/FormRegister";

export default function newAccountPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 sm:pt-52">
      <h1 className={`${titleFont.className} text-4xl mb-5`}>Nueva cuenta</h1>
      <FormRegister />
    </div>
  );
}
