import React, { useState } from "react";
import { storePath } from "../api/storeApi";
import "../styles/StoreFoam.css";

const StoreFoam = ({ onClose }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    industryCode: "",
    businessType: "",
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
    <div className="overlay">
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
          <select
            name="industryCode"
            value={formData.industryCode}
            onChange={handleChange}
            required
          >
            <option value="">선택하세요</option>
            <option value="A01">A01 - 농업</option>
            <option value="C10">C10 - 식품 제조업</option>
            <option value="G45">G45 - 자동차 판매업</option>
          </select>

          <label>업종명</label>
          <input
            type="text"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
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
