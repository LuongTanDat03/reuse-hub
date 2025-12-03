import { User, LogOut, PlusCircle, MessageCircle, ShoppingBag, Package, Map } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getProfile } from "../../../../api/profile";

export const Header = (): JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load avatar from localStorage immediately for snappy UI
  useEffect(() => {
    const cached = localStorage.getItem('avatarUrl');
    if (cached) setAvatarUrl(cached);
  }, []);

  // Fetch latest avatar from backend when user changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.id) return;
      try {
        const res = await getProfile(user.id);
        const url = (res?.data as any)?.avatarUrl || null;
        if (url) {
          setAvatarUrl(url);
          localStorage.setItem('avatarUrl', url);
        }
      } catch {
        // ignore
      }
    };
    fetchAvatar();
  }, [user?.id]);

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

  const handlePostCreate = () => {
    navigate("/dang-tin");
  };

  return (
    <header className="relative flex items-center justify-between px-8 py-4 w-full mb-14">
      {/* Logo - Clickable to go home */}
      <button
        onClick={() => navigate('/')}
        className="text-5xl font-bold text-black hover:opacity-80 transition-opacity cursor-pointer"
        title="Về trang chủ"
      >
        L<span className="text-yellow-400">O</span>G<span className="text-yellow-400">O</span>
      </button>
      
      {/* Navigation & Actions */}
          <div className="flex items-center gap-3">
           <Button
                  onClick={() => navigate('/map')}
                  className="h-11 px-4 bg-white/90 hover:bg-white text-gray-800 border-2 border-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
                  title="Map"
                >
                  <Map className="w-5 h-5 mr-2" />
                  <span>Map</span>
                </Button>
            {user && (
              <>
                {/* Giao dịch Button */}
                <Button
                  onClick={() => navigate('/transactions')}
                  className="h-11 px-4 bg-white/90 hover:bg-white text-gray-800 border-2 border-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
                  title="Giao dịch"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  <span>Giao dịch</span>
                </Button>

                {/* Quản lý tin Button */}
                <Button
                  onClick={() => navigate('/quan-ly-tin')}
                  className="h-11 px-4 bg-white/90 hover:bg-white text-gray-800 border-2 border-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
                  title="Quản lý tin"
                >
                  <Package className="w-5 h-5 mr-2" />
                  <span>Quản lý tin</span>
                </Button>

                {/* Đăng tin Button */}
                <Button
                  onClick={handlePostCreate}
                  className="h-11 px-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-yellow-300"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Đăng tin
                </Button>

                {/* Chat Button */}
                <Button
                  onClick={() => navigate('/chat')}
                  className="w-11 h-11 bg-white/90 hover:bg-white text-gray-800 border-2 border-white rounded-xl shadow-md hover:shadow-lg transition-all p-0"
                  title="Tin nhắn"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>

                {/* User Menu - Combined Button */}
                <div className="flex items-center gap-3 ml-2 pl-3 border-l-2 border-white bg-white/90 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all">
                  {/* Avatar + Username - Click to Profile */}
                  <button
                    onClick={handleAvatarClick}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    title="Trang cá nhân"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden group-hover:scale-105 transition-transform bg-white flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-bold text-gray-800">
                        {user.username}
                      </span>
                      <span className="text-xs text-gray-600">
                        Online
                      </span>
                    </div>
                  </button>

                  {/* Logout Icon - Click to Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-500 transition-colors group"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRegisterClick}
                  className="h-11 px-6 bg-white/90 hover:bg-white text-gray-800 border-2 border-white rounded-xl shadow-md hover:shadow-lg font-semibold transition-all"
                >
                  Đăng ký
                </Button>
                <Button
                  onClick={handleLoginClick}
                  className="h-11 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-yellow-300"
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
    </header>
  );
};
