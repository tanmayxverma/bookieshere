import { Link } from "react-router-dom";
import { BookOpen, Download, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionStripProps {
  variant?: 'mid' | 'bottom';
}

export function ActionStrip({ variant = 'mid' }: ActionStripProps) {
  if (variant === 'bottom') {
    return (
      <section className="py-16 bg-gradient-to-b from-transparent via-muted/30 to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Stay Updated with New Materials
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-card">
                <Link to="/materials">
                  <BookOpen className="h-5 w-5" />
                  Browse Materials
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-card">
                <Link to="/how-to-download">
                  <Download className="h-5 w-5" />
                  How to Download
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                className="gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white shadow-lg shadow-[#0088cc]/20"
              >
                <a 
                  href="https://t.me/bookieshere" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Send className="h-5 w-5" />
                  Join Telegram Channel
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-muted/50">
            <Link to="/materials">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Browse Materials
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-muted/50">
            <Link to="/how-to-download">
              <Download className="h-4 w-4 text-muted-foreground" />
              How to Download
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2 hover:bg-muted/50">
            <Link to="/support">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              Chat Support
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
