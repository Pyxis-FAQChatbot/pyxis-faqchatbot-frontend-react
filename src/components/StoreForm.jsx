import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { storeApi } from "../api/storeApi";
import IndustrySearch from "./IndustrySearch";
import DaumPostcode from 'react-daum-postcode';
import Button from "./ui/Button";
import Input from "./ui/Input";
import { X } from "lucide-react";

const StoreForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        storeName: "",
        industryCode: "",
        address: "",
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const addressStyle = {
        width: '100%',
        height: '300px',
        border: 'none',
    };

    const addressHandler = (data) => {
        setFormData((prev) => ({ ...prev, address: data.address }));
        setIsPostcodeOpen(false);
    };
    const addressCloser = (state) => {
        if (state === 'FORCE_CLOSE') {
            setIsPostcodeOpen(false);
            console.log('FORCE_CLOSE');
        } else if (state === 'COMPLETE_CLOSE') {
            setIsPostcodeOpen(false);
            console.log('COMPLETE_CLOSE');
        }
    };
    
    const handleAddressInputClick = () => {
        setIsPostcodeOpen(true);
    };
    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const res = await storeApi.ViewPath();
                setFormData({
                    storeName: res.storeName || "",
                    industryCode: res.industryCode || "",
                    address: res.address || "",
                });
                setIsEditMode(true);
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

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 animate-float border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            업체 정보 {isEditMode ? "수정" : "등록"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            개인화된 맞춤 서비스를 이용하세요!
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="사업장명"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">표준산업분류코드</label>
                        <IndustrySearch
                            onSelect={(code) =>
                                setFormData((prev) => ({ ...prev, industryCode: code }))
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">주소</label>
                        <Input
                            name="address"
                            value={formData.address}
                            placeholder="주소를 선택해주세요"
                            readOnly
                            onClick={handleAddressInputClick}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            나중에
                        </Button>
                        <Button type="submit">
                            {isEditMode ? "수정" : "등록"}
                        </Button>
                    </div>
                </form>
                </div>
            </div>
            
            {isPostcodeOpen && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">주소 검색</h3>
                            <button
                                onClick={() => setIsPostcodeOpen(false)}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <DaumPostcode
                                style={addressStyle}
                                onComplete={addressHandler}
                                onClose={addressCloser}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>,
        document.body
    );
};

export default StoreForm;
