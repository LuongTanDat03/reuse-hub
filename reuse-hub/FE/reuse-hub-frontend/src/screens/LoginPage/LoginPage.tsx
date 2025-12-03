import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { SignInRequest } from "../../types/api"; // Import SignInRequest
import { toast } from "sonner"; // Import toast

export const LoginPage = (): JSX.Element => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth(); // Destructure all needed from useAuth
  const navigate = useNavigate();
  const location = useLocation();

  // Get message from navigation state (from verify email page)
  const { message, email } = location.state || {};

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Set email if coming from verify page
  useEffect(() => {
    if (email) {
      setUsernameOrEmail(email);
      setSuccessMessage(message); // Display success message from verification
    }
  }, [email, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors/messages
    setLocalError(null);
    clearError();
    setSuccessMessage(null);

    // Basic validation
    if (!usernameOrEmail.trim()) {
      setLocalError("Vui lòng nhập username hoặc email.");
      return;
    }
    if (!password.trim()) {
      setLocalError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      const credentials: SignInRequest = {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim()
      };

      await login(credentials);
      
      toast.success("Đăng nhập thành công!");
      // Success - redirect to home page
      navigate("/");
      
    } catch (err) {
      console.error("Login failed:", err);
      // Error is already handled by AuthContext, will be displayed via `error` state
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#3c75de] flex flex-col items-center justify-center px-4">
      {/* Header với Logo */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-28 py-4">
        <div className="text-5xl font-bold text-white">
          L<span className="text-yellow-400">O</span>GO
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-md">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Đăng Nhập
          </h1>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            L<span className="text-white">O</span>GO
          </h2>
          <p className="text-blue-200 text-lg">
            Nền tảng mua bán đồ cũ uy tín
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-6">
            <p className="text-green-200 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Messages */}
        {(error || localError) && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">
              {error || localError}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Username/Email Input */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">
              Username hoặc Email
            </label>
            <Input
              type="text"
              placeholder="Nhập username hoặc email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="h-14 bg-white/10 border-2 border-white/30 rounded-[25px] text-white placeholder:text-white/70 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 px-6 text-lg"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm">
              Mật khẩu
            </label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-white/10 border-2 border-white/30 rounded-[25px] text-white placeholder:text-white/70 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 px-6 text-lg"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-[#ffc204] rounded-[50px] border-[3px] border-solid border-[#214d8c] shadow-[5px_5px_0px_#0000001a] hover:bg-[#ffc204]/90 transition-all duration-200 mt-8 disabled:opacity-50"
          >
            <span className="[font-family:'Inter',Helvetica] font-bold text-black text-lg tracking-[0] leading-[normal]">
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </span>
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={goToRegister}
            className="text-yellow-400 hover:text-yellow-300 underline text-sm font-medium transition-colors"
          >
            Chưa có tài khoản? Đăng ký ngay
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <span className="text-yellow-400 underline cursor-pointer">
              Điều khoản sử dụng
            </span>{" "}
            và{" "}
            <span className="text-yellow-400 underline cursor-pointer">
              Chính sách bảo mật
            </span>
          </p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};
