import type { ScoredTicketItem, TicketItem } from "@/models/ticket";
import {
  getInProgressTicketsAPI,
  getScoredTicketsAPI,
} from "@/services/api/ticket-api";
import { errorHandler } from "@/services/other/error-handler";
import { useEffect, useState } from "react";
import PendingTicketCard from "../components/InProgressTicketCard";
import { Skeleton } from "@/components/ui/skeleton";
import ScoredTicketCard from "../components/ScoredTicketCard";

const TicketPage = () => {
  const [inProgressTicketLoading, setInProgressTicketLoading] =
    useState<boolean>(true);
  const [inProgressTicketList, setInProgressTicketList] = useState<
    TicketItem[]
  >([]);

  const [scoredTicketLoading, setScoredTicketLoading] = useState<boolean>(true);
  const [scoredTicketList, setScoredTicketList] = useState<ScoredTicketItem[]>(
    []
  );

  const fetchInProgressTicketData = (showLoading = true) => {
    if (showLoading) setInProgressTicketLoading(true);
    const sub = getInProgressTicketsAPI().subscribe({
      next: (response) => {
        setInProgressTicketList(response);
      },
      error: (e) => {
        errorHandler(e);

        setInProgressTicketList([]);
      },
      complete: () => setInProgressTicketLoading(false),
    });

    return () => sub.unsubscribe();
  };

  useEffect(() => {
    fetchInProgressTicketData(true);
  }, []);

  const fetchScoredTicketData = (showLoading = true) => {
    if (showLoading) setScoredTicketLoading(true);
    const sub = getScoredTicketsAPI().subscribe({
      next: (response) => {
        setScoredTicketList(response);
      },
      error: (e) => {
        errorHandler(e);

        setScoredTicketList([]);
      },
      complete: () => setScoredTicketLoading(false),
    });

    return () => sub.unsubscribe();
  };

  useEffect(() => {
    fetchScoredTicketData(true);
  }, []);

  return (
    <main className="flex-1 overflow-auto">
      <div id="dashboard-content" className="p-8 space-y-12">
        {/* In Progress Tickets Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              In Progress Tickets
            </h3>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {inProgressTicketList.length} Active
            </span>
          </div>

          {inProgressTicketLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {inProgressTicketList.map((item: TicketItem, index) => (
                <PendingTicketCard key={index} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Scored Tickets Section */}
        <section id="scored-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Scored Tickets
            </h3>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {scoredTicketList?.length} Scored
            </span>
          </div>

          {scoredTicketLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {scoredTicketList.map((item: ScoredTicketItem, index) => (
                <ScoredTicketCard key={index} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default TicketPage;
