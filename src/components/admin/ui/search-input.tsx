"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FiSearch } from "react-icons/fi";

type SearchInputProps = {
  placeholder?: string;
  paramKey?: string;
};

export function SearchInput({
  placeholder = "Buscar...",
  paramKey = "q",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }

    // Reset page to 1 when searching
    params.delete("page");

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative">
      <FiSearch
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        defaultValue={searchParams.get(paramKey) ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        disabled={isPending}
      />
    </div>
  );
}
