import type { TicketItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { ArrowRight, Tag } from "lucide-react";
import { useSelector } from "react-redux";
import { getMetadata } from "@/app/redux/metadataSlice";

interface PendingTicketCardProps {
  item: TicketItem;
}

const PendingTicketCard = ({ item }: PendingTicketCardProps) => {
  const metadata = useSelector(getMetadata);
  
  const getQueueName = (queueId?: number | null) => {
    if (!queueId || !metadata?.queue) return "Unknown Queue";
    const queue = metadata.queue.find(q => q.id === queueId);
    return queue?.name || "Unknown Queue";
  };
  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-[#ee754e]/20 via-[#f49b71]/10 to-transparent p-[2px] hover:from-[#ee754e]/40 hover:via-[#f49b71]/30 smooth-transition">
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 card-shadow hover:shadow-xl smooth-transition text-left h-full">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-card-foreground text-lg leading-snug flex-1 pr-3">
            {item?.title && textShortener(item?.title, 50)}
          </h4>
          <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 text-[#ee754e] px-3 py-1.5 rounded-full font-medium border border-[#ee754e]/20 whitespace-nowrap">
            <Tag className="h-3 w-3" />
            {item?.ticketNumber}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {item?.description && textShortener(item?.description, 150)}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border smooth-transition">
          <span className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg font-medium">
            {getQueueName(item?.queueId)}
          </span>
          <a
            href={item.url}
            className="inline-flex items-center gap-2 text-[#ee754e] hover:text-[#f49b71] text-sm font-semibold group-hover:gap-3 smooth-transition"
            target="_blank"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PendingTicketCard;
