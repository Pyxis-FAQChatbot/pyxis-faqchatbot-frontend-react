import React, { useState } from "react";
import ksicData from "../assets/ksic_minimal.json";  // minimal JSON

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

    // 검색: name 또는 code로 검색
    const filtered = ksicData.filter(
      (item) =>
        item.name.includes(value) ||
        item.code.includes(value)
        // 추후에 유의어 추가
        // || item.keyword.incluces(value)
    );

    setResults(filtered.slice(0, 10)); // 최대 10개만 표시
  };

  const handleSelect = (item) => {
    onSelect(item.code);
    setQuery(item.name); // 입력창에 산업명 표시
    setResults([]); // 검색결과 닫기
  };

  return (
    <div className="industry-search-container">
      <input
        type="text"
        placeholder="업종명 또는 코드 검색"
        value={query}
        onChange={handleChange}
        className="industry-search-input"
      />

      {results.length > 0 && (
        <ul className="industry-search-results">
          {results.map((item) => (
            <li
              key={item.code}
              onClick={() => handleSelect(item)}
              className="industry-search-item"
            >
              <span className="industry-code">{item.code}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
