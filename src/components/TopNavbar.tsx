import { useState } from "react";
import { useAppSelector } from "@/hooks/store-hooks";
import { getAuth } from "@/app/redux/authSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import { Search, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { searchTicketByNumberAPI } from "@/services/api/ticket-api";

export const TopNavbar = () => {
  const auth = useAppSelector(getAuth);
  const { collapsed } = useSidebar();
  const [ticketNumber, setTicketNumber] = useState("");
  const [partnerTicketNumber, setPartnerTicketNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (ticketNumber.trim()) {
      setIsSearching(true);
      searchTicketByNumberAPI(ticketNumber.trim()).subscribe({
        next: (results) => {
          setIsSearching(false);
          if (results.length === 0) {
            toast.error("Ticket Not Found", {
              description: `Ticket number "${ticketNumber}" is not available in the system.`,
              icon: <AlertCircle className="h-5 w-5" />,
              duration: 4000,
            });
          } else {
            const ticket = results[0];
            const url = window.location.origin + "/ticket-details";
            const newWindow = window.open(url, "_blank");
            if (newWindow) {
              setTimeout(() => {
                newWindow.postMessage({ type: "TICKET_DATA", ticket }, window.location.origin);
              }, 500);
            }
            setTicketNumber("");
          }
        },
        error: (error) => {
          setIsSearching(false);
          console.error("Search error:", error);
          toast.error("Search Failed", {
            description: "An error occurred while searching for the ticket. Please try again.",
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 4000,
          });
        },
      });
    } else if (partnerTicketNumber.trim()) {
      console.log("Searching Partner Ticket Number:", partnerTicketNumber);
      // TODO: Implement partner ticket number search
    }
  };

  const handleNewTicket = () => {
    console.log("Creating new ticket");
    // TODO: Implement new ticket functionality
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`fixed top-0 ${collapsed ? 'left-20' : 'left-64'} right-0 h-16 bg-gradient-to-r from-[#ee754e] to-[#f49b71] shadow-lg z-40 flex items-center px-6 gap-3 smooth-transition`}>
      {/* Welcome Message */}
      <div className="text-white font-semibold text-sm whitespace-nowrap">
        Welcome, {auth?.user?.firstName || 'User'}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-white/20"></div>

      {/* Ticket Number Search Input */}
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Search Ticket Number"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={partnerTicketNumber.trim().length > 0}
          className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white smooth-transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Partner Ticket Number Search Input */}
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Partner Ticket Number"
          value={partnerTicketNumber}
          onChange={(e) => setPartnerTicketNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={ticketNumber.trim().length > 0}
          className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white smooth-transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="px-4 py-2 bg-white text-[#ee754e] rounded-lg font-semibold hover:bg-white/90 smooth-transition flex items-center gap-2 text-sm shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="h-4 w-4" />
        {isSearching ? "Searching..." : "Search"}
      </button>

      {/* New Ticket Button */}
      <button
        onClick={handleNewTicket}
        className="px-4 py-2 bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white rounded-lg font-semibold hover:shadow-xl smooth-transition flex items-center gap-2 text-sm shadow-md whitespace-nowrap flex-shrink-0"
      >
        <Plus className="h-4 w-4" />
        New Ticket
      </button>

      {/* App Identifier */}
      <div className="text-white font-bold text-sm px-3 py-2 bg-white/10 rounded-lg whitespace-nowrap flex-shrink-0">
        UPTIME
      </div>
    </div>
  );
};
