import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  FileText, 
  AlertCircle,
  Loader2,
  AlertTriangle,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Target,
  Pin
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/store-hooks";
import { getMetadata } from "@/app/redux/metadataSlice";
import { getTicketByIdAPI, type TicketDetails } from "@/services/api/ticket-api";
import { Sidebar } from "@/components/Sidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { useSidebar } from "@/contexts/SidebarContext";

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const metadata = useAppSelector(getMetadata);
  const { collapsed } = useSidebar();
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketInfoExpanded, setIsTicketInfoExpanded] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const [isResolutionExpanded, setIsResolutionExpanded] = useState(true);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [isCompanyContactExpanded, setIsCompanyContactExpanded] = useState(true);
  const [isTimeSummaryExpanded, setIsTimeSummaryExpanded] = useState(true);
  const [isConfigItemExpanded, setIsConfigItemExpanded] = useState(true);
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(true);

  const timelineMilestones = [
    { id: 1, type: 'sla', label: 'Ticket Created', subLabel: 'SLA Start', date: '26/11/2025 08:42', completed: true, position: 0 },
    { id: 2, type: 'target', label: 'First Response', subLabel: '', date: '26/11/2025 12:42', completed: true, position: 25 },
    { id: 3, type: 'target', label: 'Resolution Plan', subLabel: 'Resolution', date: '26/11/2025 16:42', completed: true, position: 50 },
    { id: 4, type: 'target', label: 'Complete', subLabel: '', date: '27/11/2025 08:40', completed: false, position: 75 },
  ];

  useEffect(() => {
    if (id) {
      const ticketId = parseInt(id, 10);
      if (!isNaN(ticketId)) {
        setIsLoading(true);
        getTicketByIdAPI(ticketId).subscribe({
          next: (data) => {
            console.log("[TicketDetails] Ticket data received:", data);
            setTicketData(data);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error fetching ticket:", error);
            toast.error("Failed to Load Ticket", {
              description: "Unable to fetch ticket details. Please try again.",
              icon: <AlertCircle className="h-5 w-5" />,
            });
            setIsLoading(false);
          },
        });
      }
    }
  }, [id]);

  const getStatusName = (statusId: number | null | undefined): string => {
    if (statusId === null || statusId === undefined) return "Not Set";
    if (!metadata?.status || !Array.isArray(metadata.status)) return `ID: ${statusId}`;
    const status = metadata.status.find((item) => item.id === statusId);
    return status?.name || `ID: ${statusId}`;
  };

  const getIssueTypeName = (issueTypeId: number | null | undefined): string => {
    if (issueTypeId === null || issueTypeId === undefined) return "Not Set";
    if (!metadata?.issueType || !Array.isArray(metadata.issueType)) return `ID: ${issueTypeId}`;
    const issueType = metadata.issueType.find((item) => item.id === issueTypeId);
    return issueType?.name || `ID: ${issueTypeId}`;
  };

  const getSubIssueTypeName = (subIssueTypeId: number | null | undefined): string => {
    if (subIssueTypeId === null || subIssueTypeId === undefined) return "Not Set";
    if (!metadata?.subIssueTypeMap) return `ID: ${subIssueTypeId}`;
    for (const issueTypeId in metadata.subIssueTypeMap) {
      const subIssueTypes = metadata.subIssueTypeMap[issueTypeId];
      const subIssue = subIssueTypes.find((item) => item.id === subIssueTypeId);
      if (subIssue) return subIssue.name;
    }
    return `ID: ${subIssueTypeId}`;
  };

  const getPriorityName = (priorityId: number | null | undefined): string => {
    if (priorityId === null || priorityId === undefined) return "Not Set";
    if (!metadata?.priority || !Array.isArray(metadata.priority)) return `ID: ${priorityId}`;
    const priority = metadata.priority.find((item) => item.id === priorityId);
    return priority?.name || `ID: ${priorityId}`;
  };

  const getWorkTypeName = (workTypeId: number | null | undefined): string => {
    if (workTypeId === null || workTypeId === undefined) return "Not Set";
    if (!metadata?.workType || !Array.isArray(metadata.workType)) return `ID: ${workTypeId}`;
    const workType = metadata.workType.find((item) => item.id === workTypeId);
    return workType?.name || `ID: ${workTypeId}`;
  };

  const getQueueName = (queueId: number | null | undefined): string => {
    if (queueId === null || queueId === undefined) return "Not Set";
    if (!metadata?.queue || !Array.isArray(metadata.queue)) return `ID: ${queueId}`;
    const queue = metadata.queue.find((item) => item.id === queueId);
    return queue?.name || `ID: ${queueId}`;
  };

  const getSourceName = (sourceId: number | null | undefined): string => {
    if (sourceId === null || sourceId === undefined) return "Not Set";
    if (!metadata?.source || !Array.isArray(metadata.source)) return `ID: ${sourceId}`;
    const source = metadata.source.find((item) => item.id === sourceId);
    return source?.name || `ID: ${sourceId}`;
  };

  const getSlaName = (slaId: number | null | undefined): string => {
    if (slaId === null || slaId === undefined) return "Not Set";
    if (!metadata?.sla || !Array.isArray(metadata.sla)) return `ID: ${slaId}`;
    const sla = metadata.sla.find((item) => item.id === slaId);
    return sla?.name || `ID: ${slaId}`;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const formatShortDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getResourceName = (resource: string | { id?: number; autotaskId?: number; name?: string; email?: string } | null | undefined): string => {
    if (!resource) return "N/A";
    if (typeof resource === "string") return resource;
    if (typeof resource === "object" && resource.name) return resource.name;
    return "N/A";
  };

  const getStatusBadgeColor = (statusName: string): string => {
    const lowerStatus = statusName.toLowerCase();
    if (lowerStatus.includes("progress") || lowerStatus.includes("open")) {
      return "bg-[#1fb6a6] text-white";
    }
    if (lowerStatus.includes("new")) {
      return "bg-blue-500 text-white";
    }
    if (lowerStatus.includes("complete") || lowerStatus.includes("closed")) {
      return "bg-gray-500 text-white";
    }
    if (lowerStatus.includes("hold") || lowerStatus.includes("wait")) {
      return "bg-amber-500 text-white";
    }
    return "bg-[#1fb6a6] text-white";
  };

  const getPriorityBadgeColor = (priorityName: string): string => {
    const lowerPriority = priorityName.toLowerCase();
    if (lowerPriority.includes("critical") || lowerPriority.includes("high")) {
      return "bg-[#ee754e] text-white";
    }
    if (lowerPriority.includes("medium")) {
      return "bg-[#ee754e] text-white";
    }
    if (lowerPriority.includes("low")) {
      return "bg-blue-500 text-white";
    }
    return "bg-blue-500 text-white";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background smooth-transition">
        <Sidebar />
        <TopNavbar />
        <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} mt-16 bg-background smooth-transition`}>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-[#ee754e] mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Loading Ticket...</h2>
              <p className="text-muted-foreground">Please wait while we fetch the ticket details.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="flex min-h-screen bg-background smooth-transition">
        <Sidebar />
        <TopNavbar />
        <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} mt-16 bg-background smooth-transition`}>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Ticket Not Found</h2>
              <p className="text-muted-foreground">The requested ticket could not be loaded.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const statusName = getStatusName(ticketData.statusId);
  const priorityName = getPriorityName(ticketData.priorityId);
  const companyName = ticketData.partnerCompany?.name || ticketData.company || "N/A";
  const contactName = ticketData.contact?.name || "No Contact";

  return (
    <div className="flex min-h-screen bg-background smooth-transition">
      <Sidebar />
      <TopNavbar />
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} mt-16 bg-background smooth-transition`}>
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="flex gap-0 min-h-full">
            
            {/* LEFT SIDEBAR */}
            <div className="w-[200px] min-w-[200px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
              {/* Top Section - Company, Contact, Status, Priority */}
              <div className="p-5 space-y-4">
                {/* Company */}
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Company</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                    <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                  </div>
                </div>

                {/* Contact */}
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Contact</p>
                  <p className="text-sm font-semibold text-foreground">{contactName}</p>
                </div>

                {/* Status */}
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Status</p>
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-md text-xs font-bold shadow-sm ${getStatusBadgeColor(statusName)}`}>
                      {statusName}
                    </span>
                  </div>
                </div>

                {/* Priority */}
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Priority</p>
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-md text-xs font-bold shadow-sm ${getPriorityBadgeColor(priorityName)}`}>
                      {priorityName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Information Section */}
              <div className="border-t border-border">
                <button
                  onClick={() => setIsTicketInfoExpanded(!isTicketInfoExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Ticket Information</span>
                  {isTicketInfoExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isTicketInfoExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Issue Type</p>
                      <p className="text-sm font-semibold text-foreground">{getIssueTypeName(ticketData.issueType)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sub-Issue Type</p>
                      <p className="text-sm font-semibold text-foreground">{getSubIssueTypeName(ticketData.subIssueType)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Worked by</p>
                      <p className="text-sm font-semibold text-foreground">{getResourceName(ticketData.workedBy)}</p>
                    </div>

                    {ticketData.escalationReason && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Escalation Reason</p>
                        <p className="text-sm font-semibold text-foreground">{ticketData.escalationReason}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Partner Ticket Number</p>
                      <p className="text-sm font-semibold text-foreground">{ticketData.partnerTicketNumber || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Source</p>
                      <p className="text-sm font-semibold text-foreground">{getSourceName(ticketData.sourceId)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Due Date</p>
                      <p className="text-sm font-bold text-[#ee754e]">{formatShortDate(ticketData.dueDateTime)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Service Level Agreement</p>
                      <p className="text-sm font-semibold text-foreground">{getSlaName(ticketData.slaId)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Work Type</p>
                      <p className="text-sm font-semibold text-foreground">{getWorkTypeName(ticketData.workTypeId)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Queue</p>
                      <p className="text-sm font-semibold text-foreground">{getQueueName(ticketData.queueId)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 bg-background p-6 overflow-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#ee754e] to-[#f49b71]">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#1fb6a6] text-white text-xs font-medium rounded">Standard</span>
                      <span className="px-2 py-0.5 bg-[#ee754e] text-white text-xs font-medium rounded">Service Request</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground">{ticketData.ticketNumber}</h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-2">
                <h2 className="text-xl font-semibold text-foreground">[{ticketData.title.replace(/^\[|\]$/g, '')}]</h2>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="font-medium">Created:</span>
                <span>{formatDate(ticketData.createDateTime)}</span>
                {ticketData.workedBy && (
                  <>
                    <span>-</span>
                    <span className="text-[#1fb6a6]">{getResourceName(ticketData.workedBy)}</span>
                    <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                  </>
                )}
              </div>

              {/* Description Section */}
              <div className="border border-border rounded-lg mb-4 bg-card">
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-accent/30 smooth-transition"
                >
                  {isDescriptionExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">Description</span>
                </button>
                {isDescriptionExpanded && (
                  <div className="px-4 pb-4">
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {ticketData.description || "No description available."}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="border border-border rounded-lg mb-4 bg-card">
                <button
                  onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-accent/30 smooth-transition"
                >
                  {isTimelineExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">Timeline</span>
                </button>
                {isTimelineExpanded && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="relative py-8">
                      {/* Teal Line (completed portion) */}
                      <div 
                        className="absolute left-[52px] top-1/2 -translate-y-1/2 h-[3px] bg-[#1fb6a6] rounded-full"
                        style={{ width: 'calc(40% - 20px)' }}
                      />
                      
                      {/* Gray Line (pending portion) */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-gray-300 rounded-full right-[40px]"
                        style={{ left: 'calc(40% + 32px)', width: 'calc(60% - 72px)' }}
                      />

                      {/* Milestone Points */}
                      <div className="relative flex justify-between items-center px-6">
                        {timelineMilestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="relative flex flex-col items-center"
                            onMouseEnter={() => setHoveredMilestone(milestone.id)}
                            onMouseLeave={() => setHoveredMilestone(null)}
                          >
                            {/* Tooltip */}
                            {hoveredMilestone === milestone.id && (
                              <div className="absolute bottom-full mb-3 z-20">
                                <div className="bg-[#1a2332] text-white px-4 py-3 rounded-lg shadow-xl min-w-[160px] text-center">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    {milestone.type === 'sla' ? (
                                      <Clock className="h-4 w-4 text-white" />
                                    ) : (
                                      <Target className="h-4 w-4 text-[#ee754e]" />
                                    )}
                                    <span className={`text-sm font-semibold ${milestone.type === 'sla' ? 'text-white' : 'text-[#ee754e]'}`}>
                                      {milestone.label}
                                    </span>
                                  </div>
                                  {milestone.subLabel && (
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                      <Target className="h-4 w-4 text-[#ee754e]" />
                                      <span className="text-sm font-semibold text-[#ee754e]">{milestone.subLabel}</span>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-300">{milestone.date}</p>
                                </div>
                                {/* Tooltip Arrow */}
                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#1a2332]" />
                              </div>
                            )}

                            {/* Milestone Icon */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                milestone.type === 'sla'
                                  ? 'bg-[#1fb6a6]/20 border-2 border-[#1fb6a6] hover:bg-[#1fb6a6]/30'
                                  : milestone.completed
                                  ? 'bg-white border-2 border-[#1fb6a6] hover:bg-[#1fb6a6]/10'
                                  : 'bg-white border-2 border-border hover:bg-accent/30'
                              }`}
                            >
                              {milestone.type === 'sla' ? (
                                <span className="text-[10px] font-bold text-[#1fb6a6]">SLA</span>
                              ) : (
                                <Target className={`h-5 w-5 ${milestone.completed ? 'text-[#1fb6a6]' : 'text-muted-foreground'}`} />
                              )}
                            </div>

                            {/* Small indicator under target icons */}
                            {milestone.type === 'target' && !milestone.completed && (
                              <span className="absolute -bottom-4 text-[10px] text-muted-foreground">(2)</span>
                            )}
                          </div>
                        ))}

                        {/* Pin Icon at the end */}
                        <div className="relative flex flex-col items-center">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <Pin className="h-5 w-5 text-[#1fb6a6] rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Section */}
              <div className="border border-border rounded-lg mb-6 bg-card">
                <button
                  onClick={() => setIsResolutionExpanded(!isResolutionExpanded)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-accent/30 smooth-transition"
                >
                  {isResolutionExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">Resolution</span>
                </button>
              </div>

              {/* Activity Tabs */}
              <div className="border border-border rounded-lg bg-card">
                <div className="flex border-b border-border">
                  <button className="px-4 py-3 text-sm font-medium text-[#1fb6a6] border-b-2 border-[#1fb6a6]">
                    Activity
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition">
                    Attachments (0)
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition">
                    Charges & Expenses (0)
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition">
                    Service Calls & To-Dos (0)
                  </button>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No items to display</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-[220px] min-w-[220px] flex-shrink-0 bg-card border-l border-border overflow-y-auto">
              {/* Company/Contact Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => setIsCompanyContactExpanded(!isCompanyContactExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Company/Contact</span>
                  {isCompanyContactExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isCompanyContactExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                      <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                    </div>
                    {ticketData.partnerCompany?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">{ticketData.partnerCompany.phoneNumber}</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{contactName}</p>
                  </div>
                )}
              </div>

              {/* Time Summary Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => setIsTimeSummaryExpanded(!isTimeSummaryExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Time Summary</span>
                  {isTimeSummaryExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isTimeSummaryExpanded && (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-4 text-center mb-3">
                      <div className="py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Worked</p>
                        <p className="text-2xl font-bold text-foreground">0</p>
                      </div>
                      <div className="py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Estimated</p>
                        <p className="text-2xl font-bold text-foreground">2h</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center font-medium">2h Remaining</p>
                  </div>
                )}
              </div>

              {/* Configuration Item */}
              <div className="border-b border-border">
                <button
                  onClick={() => setIsConfigItemExpanded(!isConfigItemExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Configuration Item</span>
                  {isConfigItemExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isConfigItemExpanded && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground italic">Nothing to display</p>
                  </div>
                )}
              </div>

              {/* Company Section */}
              <div>
                <button
                  onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Company</span>
                  {isCompanyExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isCompanyExpanded && (
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                      <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
