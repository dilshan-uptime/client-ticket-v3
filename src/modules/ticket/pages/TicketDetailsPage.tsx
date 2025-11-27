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
  ExternalLink
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
      return "bg-amber-500 text-white";
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
            <div className="w-64 flex-shrink-0 bg-card border-r border-border p-4 space-y-4">
              {/* Company */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Company</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-[#1fb6a6] hover:underline cursor-pointer">{companyName}</span>
                  <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <p className="text-sm font-medium text-foreground">{contactName}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(statusName)}`}>
                  {statusName}
                </span>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityBadgeColor(priorityName)}`}>
                  {priorityName}
                </span>
              </div>

              {/* Ticket Information Section */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setIsTicketInfoExpanded(!isTicketInfoExpanded)}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="text-sm font-semibold text-foreground">Ticket Information</span>
                  {isTicketInfoExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isTicketInfoExpanded && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Issue Type</p>
                      <p className="text-sm font-medium text-foreground">{getIssueTypeName(ticketData.issueType)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Sub-Issue Type</p>
                      <p className="text-sm font-medium text-foreground">{getSubIssueTypeName(ticketData.subIssueType)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Worked by</p>
                      <p className="text-sm font-medium text-foreground">{getResourceName(ticketData.workedBy)}</p>
                    </div>

                    {ticketData.escalationReason && (
                      <div>
                        <p className="text-xs text-muted-foreground">Escalation Reason</p>
                        <p className="text-sm font-medium text-foreground">{ticketData.escalationReason}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground">Partner Ticket Number</p>
                      <p className="text-sm font-medium text-foreground">{ticketData.partnerTicketNumber || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="text-sm font-medium text-foreground">{getSourceName(ticketData.sourceId)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="text-sm font-medium text-[#ee754e]">{formatShortDate(ticketData.dueDateTime)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Service Level Agreement</p>
                      <p className="text-sm font-medium text-foreground">{getSlaName(ticketData.slaId)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Work Type</p>
                      <p className="text-sm font-medium text-foreground">{getWorkTypeName(ticketData.workTypeId)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Queue</p>
                      <p className="text-sm font-medium text-foreground">{getQueueName(ticketData.queueId)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 bg-background p-6 overflow-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#ee754e] to-[#f49b71]">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#1fb6a6] text-white text-xs font-medium rounded">Standard</span>
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">Service Request</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground">{ticketData.ticketNumber}</h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">{ticketData.title}</h2>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="font-medium">Created</span>
                <span>{formatDate(ticketData.createDateTime)}</span>
                {ticketData.workedBy && (
                  <>
                    <span>-</span>
                    <span>{getResourceName(ticketData.workedBy)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </div>

              {/* Description Section */}
              <div className="border border-border rounded-lg mb-4">
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-2 w-full p-4 text-left hover:bg-accent/50 smooth-transition"
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
                    <div className="bg-card/50 rounded-lg p-4 border border-border">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {ticketData.description || "No description available."}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section (Placeholder) */}
              <div className="border border-border rounded-lg mb-4">
                <button className="flex items-center gap-2 w-full p-4 text-left hover:bg-accent/50 smooth-transition">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Timeline</span>
                </button>
              </div>

              {/* Resolution Section (Placeholder) */}
              <div className="border border-border rounded-lg mb-6">
                <button className="flex items-center gap-2 w-full p-4 text-left hover:bg-accent/50 smooth-transition">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Resolution</span>
                </button>
              </div>

              {/* Activity Tabs */}
              <div className="border border-border rounded-lg">
                <div className="flex border-b border-border">
                  <button className="px-4 py-3 text-sm font-medium text-[#ee754e] border-b-2 border-[#ee754e]">
                    Activity
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Attachments (0)
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Charges & Expenses (0)
                  </button>
                  <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Service Calls & To-Dos (0)
                  </button>
                </div>
                <div className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">No items to display</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-72 flex-shrink-0 bg-card border-l border-border p-4 space-y-6">
              {/* Company/Contact Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Company/Contact</h3>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[#1fb6a6] hover:underline cursor-pointer">{companyName}</span>
                    <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                  </div>
                  {ticketData.partnerCompany?.phoneNumber && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{ticketData.partnerCompany.phoneNumber}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{contactName}</p>
                </div>
              </div>

              {/* Time Summary Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Time Summary</h3>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Worked</p>
                    <p className="text-lg font-semibold text-foreground">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated</p>
                    <p className="text-lg font-semibold text-foreground">2h</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">2h Remaining</p>
              </div>

              {/* Configuration Item */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Configuration Item</h3>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nothing to display</p>
              </div>

              {/* Company Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Company</h3>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[#1fb6a6] hover:underline cursor-pointer">{companyName}</span>
                    <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
