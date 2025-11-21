import React, { useState } from "react";
import { storePath } from "../api/storeApi";
import IndustrySearch from "../components/IndustrySearch";
import "../styles/StoreFoam.css";

const StoreFoam = ({ onClose }) => {
  const [formData, setFormData] = useState({
    storeName: "",
    industryCode: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await storePath(formData);
      alert("등록이 완료되었습니다.");
      onClose(); // 오버레이 닫기
    } catch (error) {
      console.error(error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="store-overlay">
      <div className="company-modal">
        <h2>업체 정보 등록</h2>
        <p className="subtitle">개인화된 맞춤 서비스를 이용하세요!</p>

        <form onSubmit={handleSubmit}>
          <label>사업장명</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />

          <label>표준산업분류코드</label>
          <IndustrySearch
            onSelect={(code) =>
              setFormData((prev) => ({ ...prev, industryCode: code }))
            }
          />

          <label>주소</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" className="submit-btn">
            등록
          </button>
        </form>

        <button className="later-btn" onClick={onClose}>
          나중에
        </button>
      </div>
    </div>
  );
};

export default StoreFoam;
