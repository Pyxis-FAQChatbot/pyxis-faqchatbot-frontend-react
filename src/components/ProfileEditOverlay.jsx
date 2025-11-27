import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { myInfoPath, checkNickPath, myEditApi } from "../api/authApi";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { X } from "lucide-react";

const regions = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "제주",
    "경기도", "강원도", "경상남도", "경상북도", "전라남도", "전라북도", "충청남도", "충청북도"
];

export default function ProfileEditOverlay({ mode, onClose, onUpdated }) {
    const [profileForm, setProfileForm] = useState({
        nickname: "",
        addressMain: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [originalData, setOriginalData] = useState(null);
    const [nicknameChecked, setNicknameChecked] = useState(false);

    const fetchUserInfo = async () => {
        try {
            const res = await myInfoPath();
            setOriginalData(res);
            setProfileForm({
                nickname: res.nickname || "",
                addressMain: res.addressMain || "",
            });
        } catch (err) {
            console.error("Failed to fetch user info:", err);
        }
    };

    useEffect(() => {
        if (mode === "profile") {
            fetchUserInfo();
        }
    }, [mode]);
    const handleNicknameCheck = async () => {
        if (profileForm.nickname === originalData?.nickname) {
            alert("현재 닉네임이랑 동일합니다.");
            return;
        }

        try {
            await checkNickPath(profileForm.nickname);
            alert("사용 가능한 닉네임입니다!");
            setNicknameChecked(true);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert(err.response.data.message || "이미 사용 중인 닉네임입니다.");
                setNicknameChecked(false);
            } else {
                alert("닉네임 중복확인되어 변경이 불가합니다.");
                console.error(err);
            }
        }
    };

    const submitProfile = async (type) => {
        try {
            if (type === 'nickname') {
                if (profileForm.nickname === originalData.nickname) return;
                await myEditApi.nickPath({ newNickname: profileForm.nickname });
                alert("닉네임이 변경되었습니다.");
            } else if (type === 'address') {
                if (profileForm.addressMain === originalData.addressMain) return;
                await myEditApi.addressPath({ newAddress: profileForm.addressMain });
                alert("지역이 변경되었습니다.");
            }

            // 변경 후 최신 정보 다시 로드
            await fetchUserInfo();
            // sessionStorage도 업데이트
            const updatedInfo = await myInfoPath();
            sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
            // 부모 컴포넌트에 알림
            if (onUpdated) onUpdated();

        } catch (err) {
            console.error(err);
            if (type === 'nickname') alert("닉네임 변경에 실패했습니다.");
            else if (type === 'address') alert("지역 변경에 실패했습니다.");
        }
    }

    const submitPassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        try {
            await myEditApi.pwPath({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });
            alert("비밀번호가 변경되었습니다.");
            // 비밀번호 변경 후 최신 정보 로드
            const updatedInfo = await myInfoPath();
            sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
            // 부모 컴포넌트에 알림
            if (onUpdated) onUpdated();
            onClose();
        } catch (err) {
            alert(err.message || "비밀번호 변경 실패");
            console.error("비밀번호 에러", err);
        }
    };

    // Ensure document exists (client-side only)
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 animate-float max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {mode === "profile" ? "정보 수정" : "비밀번호 변경"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {mode === "profile" ? "닉네임과 주소를 변경하세요" : "새로운 비밀번호를 설정하세요"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {mode === "profile" ? (
                    <div className="space-y-8">
                        {/* Nickname Change Section */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            submitProfile('nickname');
                        }} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">닉네임 변경</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            name="nickname"
                                            value={profileForm.nickname}
                                            onChange={(e) => {
                                                setProfileForm({ ...profileForm, nickname: e.target.value });
                                                setNicknameChecked(false);
                                            }}
                                            placeholder="새로운 닉네임"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleNicknameCheck}
                                        className="!w-auto whitespace-nowrap !py-3 text-xs"
                                        disabled={originalData?.nickname === profileForm.nickname}
                                    >
                                        중복확인
                                    </Button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={!nicknameChecked || originalData?.nickname === profileForm.nickname}
                                className="w-full"
                            >
                                닉네임 변경
                            </Button>
                        </form>

                        <div className="border-t border-slate-100 dark:border-slate-800"></div>

                        {/* Address Change Section */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            submitProfile('address');
                        }} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">지역 변경</label>
                                <select
                                    name="addressMain"
                                    value={profileForm.addressMain}
                                    onChange={(e) => setProfileForm({ ...profileForm, addressMain: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
                                >
                                    <option value="">지역 선택</option>
                                    {regions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                type="submit"
                                disabled={originalData?.addressMain === profileForm.addressMain}
                                className="w-full"
                            >
                                지역 변경
                            </Button>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={submitPassword} className="space-y-4">
                        <Input
                            label="현재 비밀번호"
                            type="password"
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            required
                        />
                        <Input
                            label="새 비밀번호"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                        />
                        <Input
                            label="비밀번호 확인"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                        />

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                취소
                            </Button>
                            <Button type="submit">
                                변경
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
