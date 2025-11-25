import { useState } from "react";
import { useAppSelector } from "@/hooks/store-hooks";
import { getAuth } from "@/app/redux/authSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import { Search, Plus } from "lucide-react";

export const TopNavbar = () => {
  const auth = useAppSelector(getAuth);
  const { collapsed } = useSidebar();
  const [ticketNumber, setTicketNumber] = useState("");
  const [partnerTicketNumber, setPartnerTicketNumber] = useState("");

  const handleSearch = () => {
    if (ticketNumber.trim() || partnerTicketNumber.trim()) {
      console.log("Searching - Ticket Number:", ticketNumber, "Partner Ticket Number:", partnerTicketNumber);
      // TODO: Implement actual search functionality
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
        className="px-4 py-2 bg-white text-[#ee754e] rounded-lg font-semibold hover:bg-white/90 smooth-transition flex items-center gap-2 text-sm shadow-md whitespace-nowrap"
      >
        <Search className="h-4 w-4" />
        Search
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
