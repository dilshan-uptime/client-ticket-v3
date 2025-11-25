import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  Building2,
  Tag,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/store-hooks";
import { getMetadata } from "@/app/redux/metadataSlice";
import { getTicketByIdAPI, type TicketDetails } from "@/services/api/ticket-api";

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const metadata = useAppSelector(getMetadata);
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const ticketId = parseInt(id, 10);
      if (!isNaN(ticketId)) {
        setIsLoading(true);
        getTicketByIdAPI(ticketId).subscribe({
          next: (data) => {
            console.log("[TicketDetails] Ticket data received:", data);
            console.log("[TicketDetails] Metadata available:", metadata);
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
  }, [id, metadata]);

  const getStatusName = (statusId: number | null | undefined): string => {
    if (!statusId && statusId !== 0) return "Not Set";
    if (!metadata?.status) return `ID: ${statusId}`;
    const status = metadata.status.find((item) => item.id === statusId);
    return status?.name || `ID: ${statusId}`;
  };

  const getIssueTypeName = (issueTypeId: number | null | undefined): string => {
    if (!issueTypeId && issueTypeId !== 0) return "Not Set";
    if (!metadata?.issueType) return `ID: ${issueTypeId}`;
    const issueType = metadata.issueType.find((item) => item.id === issueTypeId);
    return issueType?.name || `ID: ${issueTypeId}`;
  };

  const getSubIssueTypeName = (subIssueTypeId: number | null | undefined): string => {
    if (!subIssueTypeId && subIssueTypeId !== 0) return "Not Set";
    if (!metadata?.subIssueTypeMap) return `ID: ${subIssueTypeId}`;
    for (const issueTypeId in metadata.subIssueTypeMap) {
      const subIssueTypes = metadata.subIssueTypeMap[issueTypeId];
      const subIssue = subIssueTypes.find((item) => item.id === subIssueTypeId);
      if (subIssue) return subIssue.name;
    }
    return `ID: ${subIssueTypeId}`;
  };

  const getPriorityName = (priorityId: number | null | undefined): string => {
    if (!priorityId && priorityId !== 0) return "Not Set";
    if (!metadata?.priority) return `ID: ${priorityId}`;
    const priority = metadata.priority.find((item) => item.id === priorityId);
    return priority?.name || `ID: ${priorityId}`;
  };

  const getWorkTypeName = (workTypeId: number | null | undefined): string => {
    if (!workTypeId && workTypeId !== 0) return "Not Set";
    if (!metadata?.workType) return `ID: ${workTypeId}`;
    const workType = metadata.workType.find((item) => item.id === workTypeId);
    return workType?.name || `ID: ${workTypeId}`;
  };

  const getQueueName = (queueId: number | null | undefined): string => {
    if (!queueId && queueId !== 0) return "Not Set";
    if (!metadata?.queue) return `ID: ${queueId}`;
    const queue = metadata.queue.find((item) => item.id === queueId);
    return queue?.name || `ID: ${queueId}`;
  };

  const getSourceName = (sourceId: number | null | undefined): string => {
    if (!sourceId && sourceId !== 0) return "Not Set";
    if (!metadata?.source) return `ID: ${sourceId}`;
    const source = metadata.source.find((item) => item.id === sourceId);
    return source?.name || `ID: ${sourceId}`;
  };

  const getSlaName = (slaId: number | null | undefined): string => {
    if (!slaId && slaId !== 0) return "Not Set";
    if (!metadata?.sla) return `ID: ${slaId}`;
    const sla = metadata.sla.find((item) => item.id === slaId);
    return sla?.name || `ID: ${slaId}`;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-[#ee754e] mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Ticket...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the ticket details.</p>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground">The requested ticket could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ee754e] to-[#f49b71] shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{ticketData.ticket_number}</h1>
                <p className="text-sm text-muted-foreground mt-1">Ticket ID: #{ticketData.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1fb6a6]/10 to-[#17a397]/10 border border-[#1fb6a6]/30 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-[#1fb6a6]" />
              <span className="text-sm font-semibold text-[#1fb6a6]">Active</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#ee754e]/10 to-[#f49b71]/10 rounded-xl p-6 border border-[#ee754e]/20 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Title</h3>
            <p className="text-lg font-semibold text-foreground">{ticketData.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#ee754e]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#ee754e]/10">
                  <Tag className="h-5 w-5 text-[#ee754e]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Issue Type</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getIssueTypeName(ticketData.issue_type)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#1fb6a6]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                  <Tag className="h-5 w-5 text-[#1fb6a6]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Sub-Issue Type</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getSubIssueTypeName(ticketData.sub_issue_type)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-purple-500/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <AlertCircle className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Priority</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getPriorityName(ticketData.priority_id)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#ee754e]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#ee754e]/10">
                  <Tag className="h-5 w-5 text-[#ee754e]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Work Type</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getWorkTypeName(ticketData.work_type_id)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#1fb6a6]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                  <Tag className="h-5 w-5 text-[#1fb6a6]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Queue</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getQueueName(ticketData.queue_id)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-purple-500/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <User className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Worked By</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{ticketData.worked_by}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#ee754e]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#ee754e]/10">
                  <CheckCircle2 className="h-5 w-5 text-[#ee754e]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getStatusName(ticketData.status_id)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-[#1fb6a6]/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                  <Tag className="h-5 w-5 text-[#1fb6a6]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Source</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getSourceName(ticketData.source_id)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border hover:border-purple-500/30 smooth-transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">SLA</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{getSlaName(ticketData.sla_id)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card/50 rounded-xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#ee754e]/10">
                  <Calendar className="h-5 w-5 text-[#ee754e]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Created Date</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{formatDate(ticketData.create_date)}</p>
            </div>

            <div className="bg-card/50 rounded-xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                  <Clock className="h-5 w-5 text-[#1fb6a6]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{formatDate(ticketData.due_date)}</p>
            </div>
          </div>

          {ticketData.company && (
            <div className="bg-card/50 rounded-xl p-5 border border-border mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Building2 className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{ticketData.company}</p>
            </div>
          )}

          {ticketData.partner_ticket_number && (
            <div className="bg-card/50 rounded-xl p-5 border border-border mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                  <Tag className="h-5 w-5 text-[#1fb6a6]" />
                </div>
                <h4 className="text-sm font-medium text-muted-foreground">Partner Ticket Number</h4>
              </div>
              <p className="text-base font-semibold text-foreground">{ticketData.partner_ticket_number}</p>
            </div>
          )}

          <div className="bg-card/50 rounded-xl p-6 border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h3>
            <div className="prose prose-sm max-w-none text-foreground">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-background/50 p-4 rounded-lg border border-border">
                {ticketData.description}
              </pre>
            </div>
          </div>

          {ticketData.primary_resource && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-card/50 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#ee754e]/10">
                    <User className="h-5 w-5 text-[#ee754e]" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground">Primary Resource</h4>
                </div>
                <p className="text-base font-semibold text-foreground">{ticketData.primary_resource}</p>
              </div>

              {ticketData.secondary_resource && ticketData.secondary_resource.length > 0 && (
                <div className="bg-card/50 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#1fb6a6]/10">
                      <User className="h-5 w-5 text-[#1fb6a6]" />
                    </div>
                    <h4 className="text-sm font-medium text-muted-foreground">Secondary Resources</h4>
                  </div>
                  <p className="text-base font-semibold text-foreground">{ticketData.secondary_resource.join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
