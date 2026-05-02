import { titleFont } from "@/config/fonts";
import { FormRegister } from "./ui/FormRegister";

export default function newAccountPage() {
  return (
    <div className="flex flex-col">
      <FormRegister />
    </div>
  );
}
