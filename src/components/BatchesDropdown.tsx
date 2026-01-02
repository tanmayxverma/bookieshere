import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const batches = [
  {
    title: "Arjuna JEE 2027",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    link: "https://t.me/arjunajee2027batch",
  },
  {
    title: "Lakshya JEE 2027",
    includes: ["Video Lectures", "DPPs", "Notes", "Tests & Practice Material"],
    link: "https://t.me/lakshayajee2027",
  },
];

export function BatchesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          Batches
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-80 p-4 bg-popover border border-border shadow-lg z-50"
      >
        <div className="space-y-4">
          {batches.map((batch, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-display font-semibold text-foreground text-sm">
                {batch.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Includes: {batch.includes.join(" • ")}
              </p>
              <Button
                asChild
                size="sm"
                className="w-full gap-2"
              >
                <a 
                  href={batch.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Watch Lectures
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            External batches hosted on Telegram. BOOKIE does not host video lectures or tests.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
