import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BookieAIChat } from "./BookieAI";
import { YPTFloatingTimer } from "./YPT/YPTFloatingTimer";
import { TelegramPromoPopup } from "./TelegramPromoPopup";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BookieAIChat />
      <YPTFloatingTimer />
      <TelegramPromoPopup />
    </div>
  );
}