import type { ScoredTicketItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import React from "react";
import { FaArrowRight } from "react-icons/fa";

interface ScoredTicketCardProp {
  item: ScoredTicketItem;
}

const ScoredTicketCard = ({ item }: ScoredTicketCardProp) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">
          {item?.title && textShortener(item?.title, 50)}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            {item.ticketNumber}
          </span>
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
            {item.score}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3">
        {item?.description && textShortener(item?.description, 150)}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {item.isTriage && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              Triage
            </span>
          )}
        </div>
        <a
          href={item.url}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
          target="_blank"
        >
          View Details
          <FaArrowRight className="ml-1" />
        </a>
      </div>
      <div className="text-xs text-gray-500">
        <strong>Reasons:</strong> {item?.reasons.join(", ")}
      </div>
    </div>
  );
};

export default ScoredTicketCard;
