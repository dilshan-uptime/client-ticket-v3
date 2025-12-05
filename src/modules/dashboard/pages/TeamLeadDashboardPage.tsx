import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { 
  ChevronDown, 
  RefreshCw, 
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";

interface SentimentData {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

interface Engineer {
  id: string;
  name: string;
}

interface IdleResource {
  id: string;
  name: string;
  status: 'stalled' | 'idle';
  stalledTickets: number;
  tickets: { id: string; title: string; hasTimeEntries: boolean }[];
  lastActivity: string;
  idleFor: string;
  inProgressTickets: number;
  assignedTickets: number;
  recentTicketsCount: number;
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

const mockTeams = [
  { id: '1', name: '1st Responder' },
  { id: '2', name: '2nd Line Support' },
  { id: '3', name: 'Infrastructure' },
];

const mockEngineers: Engineer[] = [
  { id: '1', name: 'Gihan' },
  { id: '2', name: 'John Smith' },
  { id: '3', name: 'Sarah Connor' },
];

const mockIdleResources: IdleResource[] = [
  {
    id: '1',
    name: 'Gihan',
    status: 'stalled',
    stalledTickets: 4,
    tickets: [
      { id: 'T20251110.0002', title: 'Ticket - Com A - 2025111002', hasTimeEntries: false },
      { id: 'T20251110.0003', title: 'Ticket GG Com A - Test 001', hasTimeEntries: false },
      { id: 'T20251111.0006', title: 'Test sample 111101', hasTimeEntries: false },
      { id: 'T20251126.0007', title: 'Title 412132', hasTimeEntries: false },
    ],
    lastActivity: '2025-11-26 17:39',
    idleFor: '7d 3h',
    inProgressTickets: 4,
    assignedTickets: 16,
    recentTicketsCount: 3,
  },
];

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
  const [selectedTeam, setSelectedTeam] = useState(mockTeams[0].id);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [idleThreshold, setIdleThreshold] = useState('30');
  const [stalledAfter, setStalledAfter] = useState('4');
  const [expandedResource, setExpandedResource] = useState<string | null>(mockIdleResources[0]?.id || null);
  const [filterEngineer, setFilterEngineer] = useState('');
  const [fromDate, setFromDate] = useState('2025-11-26');
  const [toDate, setToDate] = useState('2025-12-03');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50 focus:border-[#ee754e]"
              >
                {mockTeams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

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
                <select
                  value={selectedEngineer}
                  onChange={(e) => setSelectedEngineer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee754e]/50 focus:border-[#ee754e]"
                >
                  <option value="">Select an engineer...</option>
                  {mockEngineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>{eng.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
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
                Next Ticket for {mockEngineers.find(e => e.id === selectedEngineer)?.name}
              </p>
              <p className="text-foreground font-medium">Ticket T20251110.0001</p>
              <p className="text-[#ee754e] font-bold">Total Score: 4100</p>
              <p className="text-sm text-muted-foreground">
                Title: <a href="#" className="text-[#1fb6a6] hover:underline">Sandbox Test 20251110011T</a>
              </p>
            </div>
          )}

          {/* Idle & Stalled Resources */}
          <div className="bg-card border border-border rounded-xl mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Idle & Stalled Resources</h2>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Idle threshold:</span>
                  <select
                    value={idleThreshold}
                    onChange={(e) => setIdleThreshold(e.target.value)}
                    className="px-2 py-1 bg-background border border-border rounded text-sm text-foreground"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Stalled after:</span>
                  <select
                    value={stalledAfter}
                    onChange={(e) => setStalledAfter(e.target.value)}
                    className="px-2 py-1 bg-background border border-border rounded text-sm text-foreground"
                  >
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours</option>
                  </select>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-[#1fb6a6] hover:bg-[#1fb6a6]/10 rounded-lg transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>

            <div className="p-4">
              {mockIdleResources.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No idle resources - everyone has work assigned or in progress
                </p>
              ) : (
                mockIdleResources.map((resource) => (
                  <div key={resource.id} className="border border-border rounded-lg mb-4 last:mb-0">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{resource.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          resource.status === 'stalled' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {resource.status === 'stalled' ? 'Stalled Work' : 'Idle'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <span>How was this calculated?</span>
                        </button>
                        <button className="px-4 py-2 bg-[#ee754e] hover:bg-[#e06840] text-white text-sm font-medium rounded-lg transition-colors">
                          Assign Next Ticket
                        </button>
                      </div>
                    </div>

                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                    >
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{resource.stalledTickets} stalled in-progress ticket(s)</span>
                      </div>

                      {expandedResource === resource.id && (
                        <>
                          <div className="space-y-2 mb-4 pl-6">
                            {resource.tickets.map((ticket) => (
                              <div key={ticket.id} className="text-sm">
                                <a href="#" className="text-[#1fb6a6] hover:underline font-medium">{ticket.id}</a>
                                <span className="text-muted-foreground"> - {ticket.title}</span>
                                <br />
                                <span className={`text-xs ${ticket.hasTimeEntries ? 'text-green-500' : 'text-red-500'}`}>
                                  {ticket.hasTimeEntries ? 'Has time entries' : 'No time entries'}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1 border-t border-border pt-4">
                            <p>Last activity: <span className="text-foreground">{resource.lastActivity}</span></p>
                            <p>Idle for: <span className="text-foreground">{resource.idleFor}</span></p>
                            <p>In-progress tickets: <span className="text-foreground">{resource.inProgressTickets}</span></p>
                            <p>Assigned tickets: <span className="text-foreground">{resource.assignedTickets}</span></p>
                          </div>

                          <button className="mt-4 flex items-center gap-2 text-[#1fb6a6] hover:underline text-sm">
                            <ExternalLink className="h-3 w-3" />
                            Recent tickets ({resource.recentTicketsCount})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
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
                      {mockEngineers.map((eng) => (
                        <option key={eng.id} value={eng.id}>{eng.name}</option>
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
      </main>
    </div>
  );
};
