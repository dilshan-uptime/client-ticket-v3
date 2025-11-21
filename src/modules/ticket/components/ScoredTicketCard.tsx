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
  const [showApproveDialog, setShowApproveDialog] = useState(false);
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

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    setIsApproving(true);
    setShowApproveDialog(false);
    
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

  const handleApproveCancel = () => {
    setShowApproveDialog(false);
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
            onClick={handleApproveClick}
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
        <AlertDialogContent className="bg-card border-border max-w-md">
          <div className="flex flex-col items-center pt-6 pb-2">
            <svg width="240" height="140" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Decorative squares */}
              <rect x="30" y="15" width="16" height="16" rx="3" stroke="#1fb6a6" strokeWidth="2" fill="none" opacity="0.6" transform="rotate(-15 38 23)" />
              <rect x="194" y="40" width="14" height="14" rx="2" stroke="#ee754e" strokeWidth="2" fill="none" opacity="0.5" transform="rotate(20 201 47)" />
              
              {/* Base line */}
              <line x1="60" y1="110" x2="180" y2="110" stroke="currentColor" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
              
              {/* Left character with question mark */}
              <g>
                <circle cx="75" cy="85" r="12" fill="#cbd5e1" />
                <circle cx="75" cy="95" r="8" fill="#94a3b8" />
                <circle cx="75" cy="102" r="6" fill="#64748b" />
                <circle cx="72" cy="82" r="2" fill="#1e293b" />
                <circle cx="78" cy="82" r="2" fill="#1e293b" />
                <path d="M 70 88 Q 75 90 80 88" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
              
              {/* Large question mark - center */}
              <g transform="translate(110, 45)">
                <path d="M 0 0 Q 0 -15 10 -15 Q 20 -15 20 -5 Q 20 5 10 10 L 10 20" stroke="#ee754e" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="30" r="4" fill="#ee754e" />
              </g>
              
              {/* Middle character */}
              <g>
                <circle cx="120" cy="90" r="10" fill="#fbbf24" />
                <circle cx="120" cy="98" r="7" fill="#f59e0b" />
                <circle cx="120" cy="104" r="5" fill="#d97706" />
                <circle cx="117" cy="88" r="1.5" fill="#78350f" />
                <circle cx="123" cy="88" r="1.5" fill="#78350f" />
                <ellipse cx="120" cy="92" rx="3" ry="2" fill="#78350f" opacity="0.3" />
              </g>
              
              {/* Right character with green theme */}
              <g>
                <circle cx="165" cy="85" r="12" fill="#86efac" />
                <circle cx="165" cy="95" r="9" fill="#4ade80" />
                <circle cx="165" cy="103" r="6" fill="#22c55e" />
                <circle cx="162" cy="82" r="2" fill="#14532d" />
                <circle cx="168" cy="82" r="2" fill="#14532d" />
                <path d="M 160 88 Q 165 86 170 88" stroke="#14532d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
              
              {/* Small question marks floating */}
              <g opacity="0.4">
                <text x="50" y="50" fill="#ef4444" fontSize="20" fontWeight="bold">?</text>
                <text x="185" y="70" fill="#f97316" fontSize="16" fontWeight="bold">?</text>
              </g>
            </svg>
          </div>
          
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-foreground text-xl font-bold">
              Are you sure you want to reject this scored ticket?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground pt-2">
              Please provide a reason for rejection.
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
              disabled={!rejectReason.trim()}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <div className="flex flex-col items-center pt-6 pb-2">
            <svg width="240" height="140" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Decorative elements */}
              <circle cx="40" cy="30" r="8" fill="#10b981" opacity="0.2" />
              <circle cx="200" cy="50" r="6" fill="#34d399" opacity="0.3" />
              <rect x="25" y="20" width="12" height="12" rx="2" stroke="#1fb6a6" strokeWidth="2" fill="none" opacity="0.4" transform="rotate(15 31 26)" />
              
              {/* Base line */}
              <line x1="60" y1="110" x2="180" y2="110" stroke="currentColor" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
              
              {/* Left character - celebrating */}
              <g>
                <circle cx="70" cy="85" r="12" fill="#a7f3d0" />
                <circle cx="70" cy="95" r="9" fill="#6ee7b7" />
                <circle cx="70" cy="103" r="6" fill="#34d399" />
                <circle cx="67" cy="82" r="2" fill="#065f46" />
                <circle cx="73" cy="82" r="2" fill="#065f46" />
                <path d="M 65 88 Q 70 91 75 88" stroke="#065f46" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Arms up celebrating */}
                <line x1="58" y1="92" x2="52" y2="80" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                <line x1="82" y1="92" x2="88" y2="80" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              </g>
              
              {/* Large checkmark - center */}
              <g transform="translate(95, 35)">
                <circle cx="25" cy="25" r="28" fill="#10b981" opacity="0.1" />
                <circle cx="25" cy="25" r="22" fill="#10b981" opacity="0.2" />
                <path d="M 10 25 L 20 35 L 40 15" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              
              {/* Right character - thumbs up */}
              <g>
                <circle cx="170" cy="85" r="12" fill="#bfdbfe" />
                <circle cx="170" cy="95" r="9" fill="#93c5fd" />
                <circle cx="170" cy="103" r="6" fill="#60a5fa" />
                <circle cx="167" cy="82" r="2" fill="#1e3a8a" />
                <circle cx="173" cy="82" r="2" fill="#1e3a8a" />
                <path d="M 165 88 Q 170 91 175 88" stroke="#1e3a8a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Thumbs up */}
                <path d="M 185 90 L 185 100 M 185 90 L 182 87" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              
              {/* Sparkles */}
              <g opacity="0.6">
                <path d="M 50 45 L 52 50 L 50 55 L 48 50 Z" fill="#fbbf24" />
                <path d="M 190 65 L 192 69 L 190 73 L 188 69 Z" fill="#fbbf24" />
                <path d="M 115 15 L 117 19 L 115 23 L 113 19 Z" fill="#34d399" />
              </g>
            </svg>
          </div>
          
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-foreground text-xl font-bold">
              Are you sure you want to approve this scored ticket?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground pt-2">
              This action will mark the ticket as approved and accepted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel 
              onClick={handleApproveCancel}
              className="bg-secondary hover:bg-secondary/80 text-foreground border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-md hover:shadow-lg"
            >
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScoredTicketCard;
