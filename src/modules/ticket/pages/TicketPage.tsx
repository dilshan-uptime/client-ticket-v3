import type { ScoredTicketItem, TicketItem, CompanyTodoItem } from "@/models/ticket";
import {
  getInProgressTicketsAPI,
  getScoredTicketsAPI,
  getCompanyTodoListAPI,
} from "@/services/api/ticket-api";
import { errorHandler } from "@/services/other/error-handler";
import { useEffect, useState } from "react";
import { Activity, TrendingUp, ClipboardList } from "lucide-react";
import PendingTicketCard from "../components/InProgressTicketCard";
import { Skeleton } from "@/components/ui/skeleton";
import ScoredTicketCard from "../components/ScoredTicketCard";
import CompanyToDoCard from "../components/CompanyToDoCard";
import { Sidebar } from "@/components/Sidebar";

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

  const [companyTodoLoading, setCompanyTodoLoading] = useState<boolean>(true);
  const [companyTodoList, setCompanyTodoList] = useState<CompanyTodoItem[]>([]);

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

  const fetchCompanyTodoData = (showLoading = true) => {
    if (showLoading) setCompanyTodoLoading(true);
    const sub = getCompanyTodoListAPI().subscribe({
      next: (response) => {
        setCompanyTodoList(response);
      },
      error: (e) => {
        errorHandler(e);
        setCompanyTodoList([]);
        setCompanyTodoLoading(false);
      },
      complete: () => setCompanyTodoLoading(false),
    });

    return () => sub.unsubscribe();
  };

  useEffect(() => {
    fetchCompanyTodoData(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background smooth-transition">
      <Sidebar />
      
      <main className="flex-1 ml-64 bg-background smooth-transition">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your tickets efficiently</p>
          </div>

          <div id="dashboard-content" className="space-y-8">
            <section id="scored-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1fb6a6] to-[#17a397] shadow-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Scored Tickets</h2>
                    <p className="text-sm text-muted-foreground">Completed and evaluated tickets</p>
                  </div>
                </div>
              </div>

              {scoredTicketLoading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : scoredTicketList.length > 0 ? (
                <ScoredTicketCard item={scoredTicketList[0]} />
              ) : (
                <div className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-2xl border border-border card-shadow smooth-transition">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No scored tickets yet</p>
                </div>
              )}
            </section>

            <section id="company-todo-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Company To Do List</h2>
                    <p className="text-sm text-muted-foreground">Upcoming tasks and deadlines</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600/10 to-purple-500/10 rounded-xl border border-purple-600/20">
                  <span className="text-2xl font-bold text-purple-600">
                    {companyTodoList.length}
                  </span>
                  <span className="text-sm font-medium text-purple-600">Tickets</span>
                </div>
              </div>

              {companyTodoLoading ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ) : companyTodoList.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {companyTodoList.map((item: CompanyTodoItem) => (
                    <CompanyToDoCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-2xl border border-border card-shadow smooth-transition">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No upcoming tasks</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ee754e] to-[#f49b71] shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">In Progress Tickets</h2>
                    <p className="text-sm text-muted-foreground">Active tickets requiring attention</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 rounded-xl border border-[#ee754e]/20">
                  <span className="text-2xl font-bold text-[#ee754e]">
                    {inProgressTicketList.length}
                  </span>
                  <span className="text-sm font-medium text-[#ee754e]">Active</span>
                </div>
              </div>

              {inProgressTicketLoading ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ) : inProgressTicketList.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {inProgressTicketList.map((item: TicketItem, index) => (
                    <PendingTicketCard key={index} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-2xl border border-border card-shadow smooth-transition">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No active tickets at the moment</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketPage;
