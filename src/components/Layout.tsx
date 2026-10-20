import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";
import { BookieMentorDrawer } from "./AI/BookieMentorDrawer";
import { YPTFloatingTimer } from "./YPT/YPTFloatingTimer";
import { TelegramPromoPopup } from "./TelegramPromoPopup";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background editorial-grid text-foreground transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
      <BookieMentorDrawer />
      <YPTFloatingTimer />
      <TelegramPromoPopup />
    </div>
  );
}