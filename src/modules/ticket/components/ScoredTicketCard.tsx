import type { ScoredTicketItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { ArrowRight, Tag, Star, AlertCircle } from "lucide-react";

interface ScoredTicketCardProp {
  item: ScoredTicketItem;
}

const ScoredTicketCard = ({ item }: ScoredTicketCardProp) => {
  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-[#1fb6a6]/20 via-[#17a397]/10 to-transparent p-[2px] hover:from-[#1fb6a6]/40 hover:via-[#17a397]/30 smooth-transition">
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 card-shadow hover:shadow-xl smooth-transition text-left h-full">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-card-foreground text-lg leading-snug flex-1 pr-3">
            {item?.title && textShortener(item?.title, 50)}
          </h4>
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
          <button className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.4)] hover:shadow-[0_6px_20px_0_rgba(16,185,129,0.6)] smooth-transition active:scale-[0.98] border border-emerald-400/30 hover:border-emerald-400/50 relative overflow-hidden group/approve">
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/20 opacity-0 group-hover/approve:opacity-100 smooth-transition"></div>
            <svg className="h-5 w-5 relative z-10 group-hover/approve:scale-110 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="relative z-10 tracking-wide">Approve</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 hover:from-rose-600 hover:via-red-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(244,63,94,0.4)] hover:shadow-[0_6px_20px_0_rgba(244,63,94,0.6)] smooth-transition active:scale-[0.98] border border-rose-400/30 hover:border-rose-400/50 relative overflow-hidden group/reject">
            <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/20 opacity-0 group-hover/reject:opacity-100 smooth-transition"></div>
            <svg className="h-5 w-5 relative z-10 group-hover/reject:scale-110 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="relative z-10 tracking-wide">Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoredTicketCard;
