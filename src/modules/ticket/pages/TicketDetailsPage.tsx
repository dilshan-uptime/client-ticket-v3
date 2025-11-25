import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import type { TicketSearchResult } from "@/services/api/ticket-api";

export const TicketDetailsPage = () => {
  const [ticketData, setTicketData] = useState<TicketSearchResult | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "TICKET_DATA") {
        setTicketData(event.data.ticket);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Ticket Data</h2>
          <p className="text-muted-foreground">No ticket information available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ee754e] to-[#f49b71] shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Ticket Details</h1>
                <p className="text-sm text-muted-foreground mt-1">Detailed information about the ticket</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 rounded-xl p-6 border border-[#ee754e]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Ticket Number</label>
                  <p className="text-lg font-bold text-foreground">{ticketData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Ticket ID</label>
                  <p className="text-lg font-bold text-foreground">#{ticketData.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 rounded-xl p-6 border border-border">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Title</label>
              <p className="text-lg text-foreground leading-relaxed">{ticketData.title}</p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => window.close()}
                className="px-6 py-3 bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white rounded-lg font-semibold hover:shadow-xl smooth-transition flex items-center gap-2"
              >
                Close Tab
              </button>
              {ticketData.id && (
                <a
                  href={`https://your-ticket-system.com/tickets/${ticketData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-[#ee754e] border-2 border-[#ee754e] rounded-lg font-semibold hover:bg-[#ee754e]/5 smooth-transition flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Ticket
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
