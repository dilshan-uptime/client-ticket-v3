import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ExternalLink } from "lucide-react";
import type { TicketSearchResult } from "@/services/api/ticket-api";

interface TicketSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tickets: TicketSearchResult[];
  partnerTicketNumber: string;
  onSelectTicket: (ticketId: number) => void;
}

export const TicketSelectionDialog = ({
  open,
  onOpenChange,
  tickets,
  partnerTicketNumber,
  onSelectTicket,
}: TicketSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#ee754e] to-[#f49b71]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-foreground">Select Ticket</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Multiple tickets found for partner ticket "{partnerTicketNumber}"
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-2">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="w-full p-4 bg-card hover:bg-accent rounded-xl border border-border hover:border-[#ee754e]/50 smooth-transition text-left group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#ee754e] group-hover:text-[#ee754e]">
                      {ticket.name}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 smooth-transition" />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {ticket.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click on a ticket to view its details in a new tab
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
