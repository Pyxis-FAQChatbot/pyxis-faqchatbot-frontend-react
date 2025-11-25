import React, { useState, useEffect } from "react";
import { storeApi } from "../api/storeApi";
import IndustrySearch from "../components/IndustrySearch";
import "../styles/overlay.css";

const StoreFoam = ({ onClose }) => {
  const [formData, setFormData] = useState({
    storeName: "",
    industryCode: "",
    address: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const res = await storeApi.ViewPath(); 
        setFormData({
          storeName: res.storeName || "",
          industryCode: res.industryCode || "",
          address: res.address || "",
        });
        setIsEditMode(true); // 수정 모드로 전환
      } catch (err) {
        console.log("신규등록모드 전환");
      }
    };

    fetchStoreInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await storeApi.EditPath(formData);
        alert("수정이 완료되었습니다.");
      } else {
        await storeApi.CreatePath(formData);
        alert("등록이 완료되었습니다.");
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="store-overlay overlay">
      <div className="popup-box">
        <h2>업체 정보 {isEditMode ? "수정" : "등록"}</h2>
        <p className="subtitle">개인화된 맞춤 서비스를 이용하세요!</p>

        <form onSubmit={handleSubmit}>
          <label>사업장명</label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
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
            {isEditMode ? "수정" : "등록"}
          </button>
        </form>

        <button className="close-btn" onClick={onClose}>
          나중에
        </button>
      </div>
    </div>
  );
};

export default StoreFoam;
