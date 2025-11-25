import { useState } from "react";
import { useAppSelector } from "@/hooks/store-hooks";
import { getAuth } from "@/app/redux/authSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import { Search, Plus, ChevronDown } from "lucide-react";

export const TopNavbar = () => {
  const auth = useAppSelector(getAuth);
  const { collapsed } = useSidebar();
  const [ticketNumber, setTicketNumber] = useState("");
  const [partnerTicketNumber, setPartnerTicketNumber] = useState("");
  const [openFilter, setOpenFilter] = useState("all");
  const [recentFilter, setRecentFilter] = useState("all");

  const handleSearch = () => {
    if (ticketNumber.trim() || partnerTicketNumber.trim()) {
      console.log("Searching - Ticket Number:", ticketNumber, "Partner Ticket Number:", partnerTicketNumber, "Open:", openFilter, "Recent:", recentFilter);
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

      {/* Open Dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={openFilter}
          onChange={(e) => setOpenFilter(e.target.value)}
          className="appearance-none px-3 py-2 pr-7 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white smooth-transition text-sm font-medium cursor-pointer hover:bg-white whitespace-nowrap"
        >
          <option value="all">Open</option>
          <option value="open">Open Only</option>
          <option value="closed">Closed Only</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
      </div>

      {/* Recent Ticket Dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={recentFilter}
          onChange={(e) => setRecentFilter(e.target.value)}
          className="appearance-none px-3 py-2 pr-7 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white smooth-transition text-sm font-medium cursor-pointer hover:bg-white whitespace-nowrap"
        >
          <option value="all">Recent Ticket</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
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
