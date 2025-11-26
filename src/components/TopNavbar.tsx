import { useState } from "react";
import { useAppSelector } from "@/hooks/store-hooks";
import { getAuth } from "@/app/redux/authSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import { Search, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { searchTicketByNumberAPI, searchByPartnerTicketNumberAPI, type TicketSearchResult } from "@/services/api/ticket-api";
import { TicketSelectionDialog } from "./TicketSelectionDialog";

const TicketNotFoundToast = ({ ticketNumber }: { ticketNumber: string }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="2"/>
        <path d="M16 20C16 17.7909 17.7909 16 20 16H28C30.2091 16 32 17.7909 32 20V28C32 30.2091 30.2091 32 28 32H20C17.7909 32 16 30.2091 16 28V20Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5"/>
        <path d="M20 22L28 22" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 26L25 26" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="35" cy="35" r="8" fill="#EF4444"/>
        <path d="M32.5 35L37.5 35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Ticket Not Found
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Ticket number "<span className="font-medium text-[#ee754e]">{ticketNumber}</span>" is not available in the system.
      </p>
    </div>
  </div>
);

const PartnerTicketNotFoundToast = ({ partnerTicketNumber }: { partnerTicketNumber: string }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="2"/>
        <circle cx="22" cy="22" r="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
        <path d="M28 28L34 34" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 22H25" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M22 19V25" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="36" cy="36" r="6" fill="#F59E0B"/>
        <path d="M36 33.5V36.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="36" cy="38.5" r="0.75" fill="white"/>
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        No Tickets Found
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        No tickets found for partner ticket number "<span className="font-medium text-[#ee754e]">{partnerTicketNumber}</span>".
      </p>
    </div>
  </div>
);

export const TopNavbar = () => {
  const auth = useAppSelector(getAuth);
  const { collapsed } = useSidebar();
  const [ticketNumber, setTicketNumber] = useState("");
  const [partnerTicketNumber, setPartnerTicketNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showTicketSelectionDialog, setShowTicketSelectionDialog] = useState(false);
  const [partnerSearchResults, setPartnerSearchResults] = useState<TicketSearchResult[]>([]);
  const [searchedPartnerTicketNumber, setSearchedPartnerTicketNumber] = useState("");

  const handleSelectTicket = (ticketId: number) => {
    const url = `/ticket-details/${ticketId}`;
    window.open(url, "_blank");
    setShowTicketSelectionDialog(false);
    setPartnerTicketNumber("");
    setPartnerSearchResults([]);
  };

  const handleSearch = () => {
    if (ticketNumber.trim()) {
      setIsSearching(true);
      searchTicketByNumberAPI(ticketNumber.trim()).subscribe({
        next: (results) => {
          setIsSearching(false);
          if (results.length === 0) {
            toast.custom(() => <TicketNotFoundToast ticketNumber={ticketNumber} />, {
              duration: 5000,
              className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4",
            });
          } else {
            const ticket = results[0];
            const url = `/ticket-details/${ticket.id}`;
            window.open(url, "_blank");
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
      setIsSearching(true);
      setSearchedPartnerTicketNumber(partnerTicketNumber.trim());
      searchByPartnerTicketNumberAPI(partnerTicketNumber.trim()).subscribe({
        next: (results) => {
          setIsSearching(false);
          if (results.length === 0) {
            toast.custom(() => <PartnerTicketNotFoundToast partnerTicketNumber={partnerTicketNumber} />, {
              duration: 5000,
              className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4",
            });
          } else if (results.length === 1) {
            const ticket = results[0];
            const url = `/ticket-details/${ticket.id}`;
            window.open(url, "_blank");
            setPartnerTicketNumber("");
          } else {
            setPartnerSearchResults(results);
            setShowTicketSelectionDialog(true);
          }
        },
        error: (error) => {
          setIsSearching(false);
          console.error("Partner ticket search error:", error);
          toast.error("Search Failed", {
            description: "An error occurred while searching for the partner ticket. Please try again.",
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 4000,
          });
        },
      });
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
    <>
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

      {/* Partner Ticket Selection Dialog */}
      <TicketSelectionDialog
        open={showTicketSelectionDialog}
        onOpenChange={setShowTicketSelectionDialog}
        tickets={partnerSearchResults}
        partnerTicketNumber={searchedPartnerTicketNumber}
        onSelectTicket={handleSelectTicket}
      />
    </>
  );
};
