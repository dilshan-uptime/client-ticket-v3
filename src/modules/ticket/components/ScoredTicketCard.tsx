import type { ScoredTicketItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { ArrowRight, Tag, AlertCircle, Star } from "lucide-react";
import { acceptTicketAPI, rejectTicketAPI } from "@/services/api/ticket-api";
import { errorHandler } from "@/services/other/error-handler";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScoredTicketCardProp {
  item: ScoredTicketItem;
}

const ScoredTicketCard = ({ item }: ScoredTicketCardProp) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const formatDateTime = (dateString?: string) => {
    if (!dateString) {
      const now = new Date();
      return now.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    }
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleApprove = () => {
    setIsApproving(true);
    const sub = acceptTicketAPI(item.id).subscribe({
      next: () => {
        toast.success("Ticket approved successfully!");
        setIsApproving(false);
      },
      error: (e) => {
        errorHandler(e);
        setIsApproving(false);
      },
    });
    return () => sub.unsubscribe();
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }

    setIsRejecting(true);
    setShowRejectDialog(false);
    
    const sub = rejectTicketAPI(item.id, rejectReason).subscribe({
      next: () => {
        toast.success("Ticket rejected successfully!");
        setIsRejecting(false);
        setRejectReason("");
      },
      error: (e) => {
        errorHandler(e);
        setIsRejecting(false);
      },
    });
    return () => sub.unsubscribe();
  };

  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setRejectReason("");
  };

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-[#1fb6a6]/20 via-[#17a397]/10 to-transparent p-[2px] hover:from-[#1fb6a6]/40 hover:via-[#17a397]/30 smooth-transition">
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 card-shadow hover:shadow-xl smooth-transition text-left h-full">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-card-foreground text-lg leading-snug flex-1 pr-3">
            {item?.title && textShortener(item?.title, 50)}
          </h4>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#1fb6a6]/10 to-[#17a397]/10 text-[#1fb6a6] px-3 py-1.5 rounded-full font-medium border border-[#1fb6a6]/20 whitespace-nowrap">
                <Tag className="h-3 w-3" />
                {item.ticketNumber}
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#ee754e] to-[#f49b71] text-white px-3 py-1.5 rounded-full font-bold shadow-md">
                <Star className="h-3 w-3 fill-white" />
                {item.score}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {formatDateTime(item.scoredAt || item.createdAt)}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {item?.description && textShortener(item?.description, 150)}
        </p>
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-border smooth-transition">
          <div className="flex items-center gap-2">
            {item.isTriage && (
              <span className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg font-medium border border-destructive/20">
                <AlertCircle className="h-3 w-3" />
                Triage
              </span>
            )}
          </div>
          <a
            href={item.url}
            className="inline-flex items-center gap-2 text-[#1fb6a6] hover:text-[#17a397] text-sm font-semibold group-hover:gap-3 smooth-transition"
            target="_blank"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 border border-border smooth-transition">
          <strong className="text-card-foreground">Reasons:</strong> {item?.reasons.join(", ")}
        </div>
        
        <div className="flex items-center gap-4 mt-6 pt-5 border-t border-border">
          <button 
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.4)] hover:shadow-[0_6px_20px_0_rgba(16,185,129,0.6)] smooth-transition active:scale-[0.98] border border-emerald-400/30 hover:border-emerald-400/50 relative overflow-hidden group/approve disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/20 opacity-0 group-hover/approve:opacity-100 smooth-transition"></div>
            {isApproving ? (
              <div className="h-5 w-5 relative z-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="h-5 w-5 relative z-10 group-hover/approve:scale-110 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="relative z-10 tracking-wide">{isApproving ? "Approving..." : "Approve"}</span>
          </button>
          <button 
            onClick={handleRejectClick}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 hover:from-rose-600 hover:via-red-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(244,63,94,0.4)] hover:shadow-[0_6px_20px_0_rgba(244,63,94,0.6)] smooth-transition active:scale-[0.98] border border-rose-400/30 hover:border-rose-400/50 relative overflow-hidden group/reject disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/20 opacity-0 group-hover/reject:opacity-100 smooth-transition"></div>
            {isRejecting ? (
              <div className="h-5 w-5 relative z-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="h-5 w-5 relative z-10 group-hover/reject:scale-110 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="relative z-10 tracking-wide">{isRejecting ? "Rejecting..." : "Reject"}</span>
          </button>
        </div>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Reject Scored Ticket
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to reject this scored ticket? Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label htmlFor="reject-reason" className="block text-sm font-medium text-foreground mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejecting this ticket..."
              className="w-full min-h-[100px] px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none smooth-transition"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleRejectCancel}
              className="bg-secondary hover:bg-secondary/80 text-foreground border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg"
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScoredTicketCard;
