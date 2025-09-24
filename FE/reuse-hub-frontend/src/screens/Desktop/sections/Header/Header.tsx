import { ChevronDownIcon, User, LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";

export const Header = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
  };

  const handleAvatarClick = () => {
    navigate("/profile");
  };

  return (
    <header className="relative flex items-center justify-between px-8 py-4 w-full mb-14">
      <div className="text-5xl font-bold text-white">
        L<span className="text-yellow-400">O</span>GO
      </div>
      <div className="inline-flex items-center gap-4">
        <Button
          variant="outline"
          className="w-[139px] h-[49px] bg-black rounded-[50px] border-[3px] border-white shadow-[5px_5px_0px_#00000026] hover:bg-black/90"
        >
          <div className="inline-flex items-center gap-2">
            <span className="[font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
              Tiếng Việt
            </span>
            <ChevronDownIcon className="w-[14.72px] h-[6.75px] text-white" />
          </div>
        </Button>

        {user ? (
          // Hiển thị khi đã đăng nhập
          <div className="flex items-center gap-4">
            {/* Avatar hình tròn - Clickable */}
            <button
              onClick={handleAvatarClick}
              className="w-12 h-12 bg-[#ffc204] rounded-full flex items-center justify-center border-[3px] border-[#214d8c] shadow-[3px_3px_0px_#0000001a] hover:scale-105 transition-transform cursor-pointer"
              title="Xem thông tin cá nhân"
            >
              <User className="w-6 h-6 text-black" />
            </button>
            
            {/* Username */}
            <div className="flex flex-col">
              <span className="[font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
                {user.username}
              </span>
              <span className="[font-family:'Inter',Helvetica] text-white/70 text-xs tracking-[0] leading-[normal]">
                Đã đăng nhập
              </span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="p-2 h-auto bg-transparent hover:bg-white/10 rounded-full"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-white" />
            </Button>
          </div>
        ) : (
          // Hiển thị khi chưa đăng nhập
          <div className="flex flex-col w-[215px] h-[49px] items-center justify-center gap-2.5 px-[18px] py-2 relative bg-[#ffc204] rounded-[50px] border-[3px] border-solid border-[#214d8c] shadow-[5px_5px_0px_#0000001a]">
            <div className="inline-flex items-center gap-[18px] relative flex-[0_0_auto]">
              <Button
                variant="ghost"
                className="p-0 h-auto bg-transparent hover:bg-transparent"
                onClick={handleRegisterClick}
              >
                <span className="[font-family:'Inter',Helvetica] font-bold text-black text-sm tracking-[0] leading-[normal]">
                  Đăng Ký
                </span>
              </Button>

              <img
                className="relative w-px h-8 object-cover"
                alt="Line"
                src="/line-2.svg"
              />

              <Button
                variant="ghost"
                className="p-0 h-auto bg-transparent hover:bg-transparent"
                onClick={handleLoginClick}
              >
                <span className="[font-family:'Inter',Helvetica] font-bold text-black text-sm tracking-[0] leading-[normal]">
                  Đăng Nhập
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
