import type { CompanyTodoItem } from "@/models/ticket";
import { textShortener } from "@/utils/text-formatter";
import { ArrowRight, Calendar, ExternalLink } from "lucide-react";

interface CompanyToDoCardProps {
  item: CompanyTodoItem;
}

const CompanyToDoCard = ({ item }: CompanyToDoCardProps) => {
  const isPastDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(item.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate < today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = isPastDue();

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-400/10 to-transparent p-[2px] hover:from-purple-500/40 hover:via-purple-400/30 transition-all duration-300">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 text-left h-full">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-foreground text-lg leading-snug flex-1 pr-3">
            {textShortener(item.description, 80)}
          </h4>
          {item.ticketNumber && (
            <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-500/10 to-purple-400/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full font-medium border border-purple-500/20 whitespace-nowrap">
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

        <div className="flex items-center justify-end pt-3 border-t border-border">
          {item.ticketUrl ? (
            <a
              href={item.ticketUrl}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-semibold group-hover:gap-3 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Ticket
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic">No ticket linked</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyToDoCard;
