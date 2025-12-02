import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Header from "../components/Header";
import StoreForm from "../components/StoreForm";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { MessageCircle, Users, User, ArrowRight, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';

import { myInfoPath, myEditApi } from "../api/authApi";
import { storeApi } from "../api/storeApi";

export default function MainPage() {
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [showAddressSuccess, setShowAddressSuccess] = useState(false);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const addressStyle = {
    width: '100%',
    height: '300px',
    border: 'none',
  };

  const addressHandler = (data) => {
    setAddress(data.jibunAddress);
    setIsPostcodeOpen(false);
  };

  const addressCloser = (state) => {
    if (state === 'FORCE_CLOSE' || state === 'COMPLETE_CLOSE') {
      setIsPostcodeOpen(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (!address) {
      alert("주소를 선택해주세요.");
      return;
    }
    try {
      await myEditApi.addressPath({ newAddress: address });
      setShowAddressSuccess(true);
      const updatedInfo = await myInfoPath();
      sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
      setUserInfo(updatedInfo);
      
      // 1초 후 자동 닫기
      const timer = setTimeout(() => {
        setShowAddressForm(false);
        setShowAddressSuccess(false);
        setAddress("");
      }, 1000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error(err);
      alert("주소 저장에 실패했습니다.");
    }
  };

  useEffect(() => {
    const justSignedUp = sessionStorage.getItem("showSignupPopup");
    if (justSignedUp === "true") {
      setShowStoreForm(true);
      sessionStorage.removeItem("showSignupPopup");
    }

    // if (!sessionStorage.getItem("userinfo")) {
    //   const profile = await myInfoPath();
    //   // 프론트세션에 저장\
    //   console.log(profile);
    //   sessionStorage.setItem(
    //     "userInfo",
    //     JSON.stringify({
    //       userId: profile.id,
    //       loginId: profile.loginId,
    //       nickname: profile.nickname,
    //       role: profile.role,
    //     })
    //   );
    // }


    const fetchUser = async () => {
      try {
        const res = await myInfoPath();
        setUserInfo(res);
        // Update session storage as well
        sessionStorage.setItem("userInfo", JSON.stringify(res));

        // SNS initial login detection
        if (res.userSocial && res.userSocial !== 'NONE') {
          try {
            await storeApi.ViewPath();
          } catch (err) {
            // First-time SNS user - only show address form
            if (!res.addressMain) {
              setShowAddressForm(true);
            }
          }
        } else {
          // Non-SNS users: check for StoreForm and address
          const justSignedUp = sessionStorage.getItem("showSignupPopup");
          if (justSignedUp === "true") {
            setShowStoreForm(true);
          } else if (!res.addressMain) {
            setShowAddressForm(true);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user info", e);
        // Fallback to session storage if API fails
        const storedUser = sessionStorage.getItem("userInfo");
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        }
      }
    };
    fetchUser();
  }, []);

  const QuickAction = ({ icon: Icon, label, desc, path, color }) => (
    <button
      onClick={() => navigate(path)}
      className="w-full text-left group"
    >
      <Card className="h-full bg-white dark:bg-slate-900 shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 !p-5 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
            <Icon size={24} />
          </div>
          <ArrowRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{label}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </Card>
    </button>
  );

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {showStoreForm && (
        <StoreForm onClose={() => setShowStoreForm(false)} />
      )}

      {showAddressForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            {showAddressSuccess ? (
              <>
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    주소가 저장되었습니다
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    1초 후 자동으로 닫힙니다
                  </p>
                </div>

                <div className="pt-4">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowAddressForm(false);
                      setShowAddressSuccess(false);
                      setAddress("");
                    }} 
                    className="w-full"
                  >
                    닫기
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      주소 입력
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      원활한 사용을 위해 주소를 작성해주세요
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">주소</label>
                    <Input
                      name="address"
                      value={address}
                      placeholder="주소를 선택해주세요"
                      readOnly
                      onClick={() => setIsPostcodeOpen(true)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="button" onClick={handleAddressSubmit} className="w-full">
                      저장
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

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

      <Header type="main" />

      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Sparkles size={16} />
            <span>Welcome back</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {userInfo?.nickname || 'Guest'}님,<br />
            안녕하세요!
          </h2>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={MessageCircle}
            label="AI 채팅"
            desc="궁금한 점을 물어보세요"
            path="/chatbot"
            color="#6366f1"
          />
          <QuickAction
            icon={Users}
            label="커뮤니티"
            desc="다른 사장님들과 소통해요"
            path="/community"
            color="#ec4899"
          />
        </div>

        {/* Recent Activity / Banner */}
        <Card className="!bg-gradient-to-br !from-slate-900 !to-slate-800 !text-white !border-none overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">내 정보 관리</h3>
            <p className="text-slate-400 text-sm mb-4">
              사업장 정보를 등록하고<br />맞춤형 서비스를 받아보세요.
            </p>
            <button
              onClick={() => navigate('/mypage')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-medium transition-colors"
            >
              관리하기
            </button>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </Card>
      </main>
    </div>
  );
}
