import { ProductDisplaySection } from "./sections/ProductDisplaySection/ProductDisplaySection";
import { PromotionalBannerSection } from "./sections/PromotionalBannerSection/PromotionalBannerSection";
import { Header } from "./sections/Header/Header";
import { ChatWidget } from "../../components/ChatWidget/ChatWidget";

export const Desktop = (): JSX.Element => {
  return (
    <div className="w-full min-h-screen bg-[#3c75de]">
      {/* Header và Banner với viền xanh đậm full width */}
      <div className="bg-[#3c75de] border-b-4 border-[#1e40af] w-full">
        <div className="relative w-full">
          <img
            className="absolute w-full h-[567px] top-0 left-0 object-cover"
            alt="Group"
            src="/group-15.png"
          />

          <img
            className="absolute w-[655px] h-[713px] top-[59px] right-[100px] object-contain"
            alt="Untitled artwork"
            src="/untitled-artwork-1.png"
          />

          <Header />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#3c75de]">
        <ProductDisplaySection />
        <PromotionalBannerSection />
      </div>

      {/* Chat Widget - Floating button */}
      <ChatWidget />
    </div>
  );
};
