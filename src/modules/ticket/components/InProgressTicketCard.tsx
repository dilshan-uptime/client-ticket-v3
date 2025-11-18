import type { TicketItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { FaArrowRight } from "react-icons/fa";

interface PendingTicketCardProps {
  item: TicketItem;
}

const PendingTicketCard = ({ item }: PendingTicketCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">
          {item?.title && textShortener(item?.title, 50)}
        </h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {item?.ticketNumber}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">
        {item?.description && textShortener(item?.description, 150)}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {item?.queue}
        </span>
        <a
          href={item.url}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          target="_blank"
        >
          View Details
          <FaArrowRight className="ml-1" />
        </a>
      </div>
    </div>
  );
};

export default PendingTicketCard;
