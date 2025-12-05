import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { getTeamsAPI, getUsersByTeamAPI, getCheckResourcesAPI } from "@/services/api/team-lead-api";
import type { Team, User, IdleResource as ApiIdleResource } from "@/services/api/team-lead-api";
import { toast } from "sonner";
import { 
  ChevronDown, 
  RefreshCw, 
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2
} from "lucide-react";

interface SentimentData {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

interface Decision {
  id: string;
  dateTime: string;
  engineer: string;
  ticket: string;
  action: 'accepted' | 'rejected';
  reason: string;
  timeToDecide: string;
  slaAtDecision: string;
}

const mockDecisions: Decision[] = [
  {
    id: '1',
    dateTime: '2025-11-26 17:39',
    engineer: 'Gihan',
    ticket: '#412095',
    action: 'accepted',
    reason: '-',
    timeToDecide: '0s',
    slaAtDecision: '-',
  },
];

export const TeamLeadDashboardPage = () => {
  const { collapsed } = useSidebar();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [idleResources, setIdleResources] = useState<ApiIdleResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [idleThreshold, setIdleThreshold] = useState('30');
  const [stalledAfter, setStalledAfter] = useState('4');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [filterEngineer, setFilterEngineer] = useState('');
  const [fromDate, setFromDate] = useState('2025-11-26');
  const [toDate, setToDate] = useState('2025-12-03');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const isTeamSelected = selectedTeam !== '';

  useEffect(() => {
    const subscription = getTeamsAPI().subscribe({
      next: (data) => {
        setTeams(data);
        setIsLoadingTeams(false);
      },
      error: (err) => {
        console.error('Failed to fetch teams:', err);
        toast.error('Failed to load teams');
        setIsLoadingTeams(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setUsers([]);
      setSelectedEngineer('');
      return;
    }

    setIsLoadingUsers(true);
    setSelectedEngineer('');
    const subscription = getUsersByTeamAPI(selectedTeam).subscribe({
      next: (data) => {
        setUsers(data);
        setIsLoadingUsers(false);
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        toast.error('Failed to load engineers');
        setIsLoadingUsers(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam) {
      setIdleResources([]);
      return;
    }

    setIsLoadingResources(true);
    const subscription = getCheckResourcesAPI(selectedTeam).subscribe({
      next: (data) => {
        setIdleResources(data);
        setIsLoadingResources(false);
        if (data.length > 0) {
          setExpandedResource(data[0].creator.id);
        }
      },
      error: (err) => {
        console.error('Failed to fetch resources:', err);
        toast.error('Failed to load idle resources');
        setIsLoadingResources(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [selectedTeam]);

  const formatIdleDuration = (minutes: number | null): string => {
    if (minutes === null) return 'N/A';
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatLastActivity = (dateStr: string | null): string => {
    if (!dateStr) return 'No activity';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sentimentData: SentimentData[] = [
    { label: 'Frustrated', count: 0, color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
    { label: 'Urgent', count: 0, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Negative', count: 0, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
    { label: 'Neutral', count: 0, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    { label: 'Positive', count: 0, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  ];

  const stats = {
    accepted: 1,
    rejected: 0,
    acceptanceRate: '100.0%',
    lastAccepted: '2025-11-26 17:39',
    lastRejected: '-',
  };

  const totalDecisions = mockDecisions.length;
  const totalPages = Math.ceil(totalDecisions / pageSize);

  return (
    <div className="min-h-screen bg-background smooth-transition">
      <Sidebar />
      <main className={`${collapsed ? 'ml-0' : 'ml-[156px]'} min-h-screen bg-background smooth-transition`}>
        <div className="p-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-foreground mb-6">Team Lead Dashboard</h1>

          {/* Select Team */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Select Team</label>
            <div className="relative">
              {isLoadingTeams ? (
                <div className="w-full px-4 py-3 bg-card border border-border rounded-lg flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Loading teams...</span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50 focus:border-[#ee754e]"
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </>
              )}
            </div>
          </div>

          {/* Content wrapper - disabled when no team selected */}
          <div className={`${!isTeamSelected ? 'opacity-50 pointer-events-none' : ''}`}>
            {!isTeamSelected && (
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                  Please select a team to view dashboard data
                </p>
              </div>
            )}

            {/* Ticket Sentiment Analysis */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Ticket Sentiment Analysis</h2>
            
            <div className="flex justify-between items-center mb-8 px-8">
              {sentimentData.map((sentiment) => (
                <div key={sentiment.label} className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 border-[3px]"
                    style={{ 
                      borderColor: sentiment.color,
                      backgroundColor: sentiment.bgColor,
                      color: sentiment.color
                    }}
                  >
                    {sentiment.count}
                  </div>
                  <span className="text-sm text-muted-foreground">{sentiment.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm text-muted-foreground border-t border-border pt-4">
              <div>
                <span>Total Analyzed</span>
                <br />
                <span>Needs Attention</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-foreground">0 tickets</span>
                <br />
                <span className="text-[#ee754e] font-medium">0 tickets</span>
              </div>
            </div>
          </div>

          {/* Select Engineer & Check Ticket Position - Same Line */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            {/* Select Engineer */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Select Engineer</label>
              <div className="relative">
                {isLoadingUsers ? (
                  <div className="w-full px-4 py-2.5 bg-card border border-border rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Loading engineers...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedEngineer}
                      onChange={(e) => setSelectedEngineer(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50 focus:border-[#ee754e]"
                    >
                      <option value="">Select an engineer...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </>
                )}
              </div>
            </div>
            <button className="px-4 py-2.5 bg-[#ee754e] hover:bg-[#e06840] text-white font-medium rounded-lg transition-colors whitespace-nowrap">
              Show Next Ticket
            </button>

            {/* Check Ticket Position */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Check Ticket Position</label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="Enter ticket number..."
                className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50 focus:border-[#ee754e]"
              />
            </div>
            <button className="px-4 py-2.5 bg-[#1fb6a6] hover:bg-[#1a9e91] text-white font-medium rounded-lg transition-colors whitespace-nowrap">
              See Ticket Position
            </button>
          </div>

          {/* Next Ticket Info */}
          {selectedEngineer && (
            <div className="mb-6 p-4 bg-card border border-border rounded-lg">
              <p className="font-semibold text-foreground mb-1">
                Next Ticket for {users.find(u => u.id.toString() === selectedEngineer)?.name}
              </p>
              <p className="text-foreground font-medium">Ticket T20251110.0001</p>
              <p className="text-[#ee754e] font-bold">Total Score: 4100</p>
              <p className="text-sm text-muted-foreground">
                Title: <a href="#" className="text-[#1fb6a6] hover:underline">Sandbox Test 20251110011T</a>
              </p>
            </div>
          )}

          {/* Idle & Stalled Resources */}
          <div className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-gradient-to-r from-card to-accent/5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ee754e] to-[#f49b71] flex items-center justify-center shadow-lg shadow-[#ee754e]/20">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Idle & Stalled Resources</h2>
                  <p className="text-xs text-muted-foreground">{idleResources.length} resource(s) need attention</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Idle:</span>
                  <select
                    value={idleThreshold}
                    onChange={(e) => setIdleThreshold(e.target.value)}
                    className="px-1.5 py-0.5 bg-transparent text-xs text-foreground focus:outline-none"
                  >
                    <option value="15">15m</option>
                    <option value="30">30m</option>
                    <option value="60">1h</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground">Stalled:</span>
                  <select
                    value={stalledAfter}
                    onChange={(e) => setStalledAfter(e.target.value)}
                    className="px-1.5 py-0.5 bg-transparent text-xs text-foreground focus:outline-none"
                  >
                    <option value="2">2h</option>
                    <option value="4">4h</option>
                    <option value="8">8h</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-[#1fb6a6] hover:bg-[#1fb6a6]/10 rounded-lg transition-all duration-200 hover:scale-105">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
            </div>

            <div className="p-4">
              {isLoadingResources ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ee754e]" />
                    <span className="text-sm text-muted-foreground">Loading resources...</span>
                  </div>
                </div>
              ) : idleResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-foreground font-medium mb-1">All Clear!</p>
                  <p className="text-sm text-muted-foreground">Everyone has work assigned or in progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {idleResources.map((resource) => {
                    const getTicketUrl = (ticketId: number) => {
                      const recentTicket = resource.recentTickets.find(t => t.id === ticketId);
                      return recentTicket?.url || '#';
                    };
                    
                    return (
                      <div 
                        key={resource.creator.id} 
                        className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                          expandedResource === resource.creator.id 
                            ? 'border-[#1fb6a6]/30 shadow-md' 
                            : 'border-border hover:border-[#1fb6a6]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between p-4 bg-card">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1fb6a6] flex items-center justify-center text-white font-semibold text-base">
                              {resource.creator.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{resource.creator.name.split(' (')[0]}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  resource.idleType === 'stalled' 
                                    ? 'bg-[#ee754e] text-white' 
                                    : 'bg-amber-500 text-white'
                                }`}>
                                  {resource.idleType === 'stalled' ? 'Stalled' : 'Idle'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1fb6a6]"></span>
                                  {resource.inProgressCount} in progress
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1fb6a6]"></span>
                                  {resource.assignedCount} assigned
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-[#ee754e] hover:bg-[#e06840] text-white text-sm font-medium rounded-lg transition-colors">
                            Assign Next Ticket
                          </button>
                        </div>

                        <div 
                          className="px-4 py-3 cursor-pointer border-t border-border/50"
                          onClick={() => setExpandedResource(expandedResource === resource.creator.id ? null : resource.creator.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#ee754e]">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">{resource.stalledTickets.length} stalled ticket(s)</span>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                              expandedResource === resource.creator.id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>

                        {expandedResource === resource.creator.id && (
                          <div className="border-t border-border/50">
                            {resource.stalledTickets.length > 0 && (
                              <div className="divide-y divide-border/30">
                                {resource.stalledTickets.map((ticket) => (
                                  <div 
                                    key={ticket.ticketId} 
                                    className="flex items-center justify-between px-4 py-3 border-l-2 border-[#ee754e]/40" style={{ backgroundColor: 'var(--stalled-row-bg)' }}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <a 
                                          href={getTicketUrl(ticket.ticketId)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-[#1fb6a6] hover:underline font-medium text-sm"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {ticket.ticketNumber}
                                        </a>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-sm text-foreground dark:text-gray-300">{ticket.title}</span>
                                      </div>
                                      <span className="text-xs text-[#ee754e]">
                                        {ticket.stalledReason}
                                      </span>
                                    </div>
                                    <a 
                                      href={getTicketUrl(ticket.ticketId)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-4 gap-4 p-4 bg-[#1fb6a6] text-white">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{resource.inProgressCount}</p>
                                <p className="text-xs opacity-80">In Progress</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{resource.assignedCount}</p>
                                <p className="text-xs opacity-80">Assigned</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{formatIdleDuration(resource.idleDurationMinutes)}</p>
                                <p className="text-xs opacity-80">Idle Duration</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium">{formatLastActivity(resource.lastActivity)}</p>
                                <p className="text-xs opacity-80">Last Activity</p>
                              </div>
                            </div>

                            {resource.recentTickets.length > 0 && (
                              <div className="px-4 py-3 border-t border-border/50">
                                <a 
                                  href={resource.recentTickets[0]?.url || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[#1fb6a6] hover:underline text-sm font-medium"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  View {resource.recentTickets.length} recent tickets
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Accept/Reject Review */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Accept/Reject Review</h2>
              
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-muted-foreground mb-1">Engineer (optional)</label>
                  <div className="relative">
                    <select
                      value={filterEngineer}
                      onChange={(e) => setFilterEngineer(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50"
                    >
                      <option value="">All engineers</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="min-w-[160px]">
                  <label className="block text-sm text-muted-foreground mb-1">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50"
                  />
                </div>

                <div className="min-w-[160px]">
                  <label className="block text-sm text-muted-foreground mb-1">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50"
                  />
                </div>

                <button className="px-4 py-2 bg-[#ee754e] hover:bg-[#e06840] text-white font-medium rounded-lg transition-colors">
                  Apply
                </button>
                <button className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors">
                  Reset
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.accepted}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Acceptance Rate</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.acceptanceRate}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Last Accepted</p>
                <p className="text-lg font-semibold text-foreground">{stats.lastAccepted}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Last Rejected</p>
                <p className="text-foreground">{stats.lastRejected}</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing 1-{Math.min(pageSize, totalDecisions)} of {totalDecisions} decisions
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors">
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Export CSV</span>
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date/Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Engineer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ticket</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Time to Decide</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SLA at Decision</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDecisions.map((decision) => (
                    <tr key={decision.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">{decision.dateTime}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{decision.engineer}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{decision.ticket}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          decision.action === 'accepted'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {decision.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{decision.reason}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{decision.timeToDecide}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{decision.slaAtDecision}</td>
                      <td className="px-4 py-3">
                        <a href="#" className="text-[#1fb6a6] hover:underline text-sm font-medium">Open</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm">Previous</span>
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};
