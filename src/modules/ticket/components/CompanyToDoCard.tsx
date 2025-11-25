import type { CompanyTodoItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { ArrowRight, Calendar, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { acceptTicketAPI } from "@/services/api/ticket-api";
import { errorHandler } from "@/services/other/error-handler";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyToDoCardProps {
  item: CompanyTodoItem;
}

const CompanyToDoCard = ({ item }: CompanyToDoCardProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const isPastDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(item.startDate);
    const startDateLocal = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    
    return startDateLocal < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isOverdue = isPastDue();

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    if (!item.ticketId) return;
    
    setIsApproving(true);
    setShowApproveDialog(false);
    
    const sub = acceptTicketAPI(item.ticketId).subscribe({
      next: () => {
        toast.success("To-Do approved successfully!");
        setIsApproving(false);
      },
      error: (e) => {
        errorHandler(e);
        setIsApproving(false);
      },
    });
    return () => sub.unsubscribe();
  };

  const handleApproveCancel = () => {
    setShowApproveDialog(false);
  };

  return (
    <>
    <div className="group relative rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-transparent p-[2px] hover:from-purple-500/40 hover:via-purple-400/30 smooth-transition">
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 card-shadow hover:shadow-xl smooth-transition text-left h-full">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-card-foreground text-lg leading-snug flex-1 pr-3">
            {textShortener(item.description, 80)}
          </h4>
          {item.ticketNumber && (
            <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-500/10 to-purple-400/10 text-purple-600 px-3 py-1.5 rounded-full font-medium border border-purple-500/20 whitespace-nowrap">
              <ExternalLink className="h-3 w-3" />
              {item.ticketNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
            {formatDate(item.startDate)}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          {item.ticketUrl ? (
            <a
              href={item.ticketUrl}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-semibold group-hover:gap-3 smooth-transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Ticket
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic">No ticket linked</span>
          )}
          
          {item.ticketId && (
            <button
              onClick={handleApproveClick}
              disabled={isApproving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white rounded-lg font-semibold hover:shadow-lg smooth-transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Approve Confirmation Dialog */}
    <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
      <AlertDialogContent className="max-w-md bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center mb-4 text-card-foreground">
            Approve To-Do?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-muted-foreground">
            <div className="flex justify-center mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="50" fill="#ee754e" opacity="0.1"/>
                <circle cx="45" cy="45" r="15" fill="#ee754e" opacity="0.3"/>
                <circle cx="45" cy="45" r="8" fill="#ee754e"/>
                <path d="M40 45 L43 48 L50 41" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="75" cy="45" r="15" fill="#ee754e" opacity="0.3"/>
                <circle cx="75" cy="45" r="8" fill="#ee754e"/>
                <path d="M70 45 L73 48 L80 41" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35 70 Q60 85 85 70" stroke="#ee754e" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="50" cy="75" r="2" fill="#ee754e"/>
                <circle cx="70" cy="75" r="2" fill="#ee754e"/>
              </svg>
            </div>
            <p className="text-center text-base">
              Are you sure you want to approve this to-do item?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={handleApproveCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg font-semibold hover:bg-accent smooth-transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApproveConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white rounded-lg font-semibold hover:shadow-lg smooth-transition"
          >
            Approve
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default CompanyToDoCard;
