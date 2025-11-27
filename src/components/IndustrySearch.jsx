import React, { useState } from "react";
import ksicData from "../assets/ksic_minimal.json";
import Input from "./ui/Input";

export default function IndustrySearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const filtered = ksicData.filter(
      (item) =>
        item.name.includes(value) ||
        item.code.includes(value)
    );

    setResults(filtered.slice(0, 10));
  };

  const handleSelect = (item) => {
    onSelect(item.code);
    setQuery(item.name);
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <Input
        placeholder="업종명 또는 코드 검색"
        value={query}
        onChange={handleChange}
        className="!mt-0"
      />

      {results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li
              key={item.code}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none text-sm text-slate-700 flex justify-between items-center"
            >
              <span>{item.name}</span>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
