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
  Pin,
  Filter,
  Search,
  Paperclip,
  RefreshCw,
  MapPin,
  Pencil,
  Save,
  X,
  Plus,
  Check,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  Calendar,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/store-hooks";
import { getMetadata } from "@/app/redux/metadataSlice";
import { getTicketByIdAPI, getTicketNotesAPI, updateTicketAPI, type TicketDetails, type TicketNote, type UpdateTicketPayload } from "@/services/api/ticket-api";
import { Sidebar } from "@/components/Sidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { useSidebar } from "@/contexts/SidebarContext";

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const metadata = useAppSelector(getMetadata);
  const { collapsed } = useSidebar();
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [ticketNotes, setTicketNotes] = useState<TicketNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [isTicketInfoExpanded, setIsTicketInfoExpanded] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const [isResolutionExpanded, setIsResolutionExpanded] = useState(true);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [isCompanyContactExpanded, setIsCompanyContactExpanded] = useState(true);
  const [isTimeSummaryExpanded, setIsTimeSummaryExpanded] = useState(true);
  const [isConfigItemExpanded, setIsConfigItemExpanded] = useState(true);
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(true);
  const [isAssignmentExpanded, setIsAssignmentExpanded] = useState(true);
  const [isBillingExpanded, setIsBillingExpanded] = useState(true);
  const [isUserDefinedExpanded, setIsUserDefinedExpanded] = useState(true);
  const [activeActivityTab, setActiveActivityTab] = useState<'activity' | 'attachments' | 'charges' | 'serviceCalls'>('activity');
  const [showSystemNotes, setShowSystemNotes] = useState(false);
  const [showBillingData, setShowBillingData] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);
  const [isNewAttachmentModalOpen, setIsNewAttachmentModalOpen] = useState(false);
  const [newAttachment, setNewAttachment] = useState({ type: 'Attachment (10 MB maximum)', file: null as File | null, name: '' });
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    resolution: '',
    statusId: 0,
    priorityId: 0,
    issueTypeId: 0,
    subIssueTypeId: 0,
    sourceId: 0,
    queueId: 0,
    workTypeId: 0,
    slaId: 0,
    dueDate: '',
    dueTime: '',
    estimatedHours: '',
    partnerTicketNumber: '',
    automaticChaseId: 0,
    workedById: 0,
    escalationReasonId: 0,
    ticketCategory: 'Standard',
    ticketType: 'Service Request',
    additionalContacts: '',
    primaryResourceId: 0,
    secondaryResourceIds: [] as number[],
    outOfHoursAction: 'Reassign',
    sdmCheck: '',
    contract: '',
    serviceBundle: '',
    imacApproval: '',
    purchaseOrderNumber: '',
  });
  
  const [checklistItems, setChecklistItems] = useState<Array<{id: number; name: string; completed: boolean; important: boolean}>>([]);

  const formatTimelineDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getTimelineMilestones = () => {
    if (!ticketData) return [];
    
    const milestones = [
      { 
        id: 1, 
        type: 'sla', 
        label: 'Ticket Created', 
        subLabel: 'SLA Start', 
        date: formatTimelineDate(ticketData.createDateTime),
        targetDate: ticketData.createDateTime,
        actualDate: ticketData.createDateTime,
        completed: !!ticketData.createDateTime, 
        position: 0 
      },
      { 
        id: 2, 
        type: 'target', 
        label: 'First Response', 
        subLabel: ticketData.firstResponseDateTime ? 'Completed' : 'Due', 
        date: formatTimelineDate(ticketData.firstResponseDateTime || ticketData.firstResponseDueDateTime),
        targetDate: ticketData.firstResponseDueDateTime,
        actualDate: ticketData.firstResponseDateTime,
        completed: !!ticketData.firstResponseDateTime, 
        position: 33 
      },
      { 
        id: 3, 
        type: 'target', 
        label: 'Resolution Plan', 
        subLabel: ticketData.resolvedPlanDateTime ? 'Completed' : 'Due', 
        date: formatTimelineDate(ticketData.resolvedPlanDateTime || ticketData.resolvedPlanDueDateTime),
        targetDate: ticketData.resolvedPlanDueDateTime,
        actualDate: ticketData.resolvedPlanDateTime,
        completed: !!ticketData.resolvedPlanDateTime, 
        position: 66 
      },
      { 
        id: 4, 
        type: 'target', 
        label: 'Complete', 
        subLabel: ticketData.resolvedDateTime ? 'Resolved' : 'Due', 
        date: formatTimelineDate(ticketData.resolvedDateTime || ticketData.resolvedDueDateTime),
        targetDate: ticketData.resolvedDueDateTime,
        actualDate: ticketData.resolvedDateTime,
        completed: !!ticketData.resolvedDateTime, 
        position: 100 
      },
    ];
    
    return milestones;
  };

  const getTimelineProgress = (): number => {
    const milestones = getTimelineMilestones();
    if (milestones.length === 0) return 0;
    
    const completedCount = milestones.filter(m => m.completed).length;
    if (completedCount === 0) return 0;
    if (completedCount === milestones.length) return 100;
    
    const lastCompletedIndex = milestones.reduce((lastIdx, m, idx) => m.completed ? idx : lastIdx, -1);
    if (lastCompletedIndex === -1) return 0;
    
    return milestones[lastCompletedIndex].position;
  };

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

  useEffect(() => {
    if (id) {
      const ticketId = parseInt(id, 10);
      if (!isNaN(ticketId)) {
        setIsNotesLoading(true);
        getTicketNotesAPI(ticketId).subscribe({
          next: (notes) => {
            console.log("[TicketDetails] Notes received:", notes);
            setTicketNotes(notes);
            setIsNotesLoading(false);
          },
          error: (error) => {
            console.error("Error fetching notes:", error);
            setIsNotesLoading(false);
          },
        });
      }
    }
  }, [id]);

  const formatNoteDate = (dateString: string): string => {
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
    } catch {
      return "Invalid Date";
    }
  };

  const getFilteredNotes = (): TicketNote[] => {
    let notes = ticketNotes;
    if (!showSystemNotes) {
      notes = notes.filter(note => note.noteTypeId !== 13);
    }
    return notes.sort((a, b) => new Date(b.createDateTime).getTime() - new Date(a.createDateTime).getTime());
  };

  const getAttachmentCount = (): number => {
    return ticketNotes.reduce((count, note) => count + note.attachments.length, 0);
  };

  const getCreatorInitials = (creator: string | { id?: number; name?: string; email?: string } | null): string => {
    if (!creator) return "SY";
    const creatorName = typeof creator === 'object' ? creator.name : creator;
    if (!creatorName) return "SY";
    const parts = creatorName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return creatorName.substring(0, 2).toUpperCase();
  };

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

  const getAutomaticChaseDisplayName = (): string => {
    if (ticketData?.automaticChase === null || ticketData?.automaticChase === undefined) return "Not Set";
    return ticketData.automaticChase ? 'Yes' : 'No';
  };

  const getWorkedByDisplayName = (): string => {
    if (ticketData?.workedBy) {
      if (typeof ticketData.workedBy === 'string') {
        return ticketData.workedBy;
      } else if (ticketData.workedBy?.name) {
        return ticketData.workedBy.name;
      }
    }
    return "Not Set";
  };

  const getEscalationReasonDisplayName = (): string => {
    if (ticketData?.escalationReason) {
      return ticketData.escalationReason;
    }
    return "Not Set";
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

  const getAutomaticChaseIdFromBoolean = (automaticChase: boolean | null): number => {
    if (automaticChase === null || automaticChase === undefined) return 0;
    if (!metadata?.automaticChase || !Array.isArray(metadata.automaticChase)) return 0;
    const targetName = automaticChase ? 'Yes' : 'No';
    const found = metadata.automaticChase.find(item => item.name === targetName);
    return found?.id || 0;
  };

  const getWorkedByIdFromName = (workedByName: string): number => {
    if (!metadata?.workedBy || !workedByName) return 0;
    const selected = metadata.workedBy.find(item => item.name === workedByName);
    return selected?.id || 0;
  };

  const getEscalationReasonIdFromName = (escalationReasonName: string): number => {
    if (!metadata?.escalationReason || !escalationReasonName) return 0;
    const selected = metadata.escalationReason.find(item => item.name === escalationReasonName);
    return selected?.id || 0;
  };

  const enterEditMode = () => {
    if (!ticketData) return;
    
    const dueDateObj = ticketData.dueDateTime ? new Date(ticketData.dueDateTime) : null;
    const workedByName = typeof ticketData.workedBy === 'string' 
      ? ticketData.workedBy 
      : ticketData.workedBy?.name || '';
    
    setEditForm({
      title: ticketData.title || '',
      description: ticketData.description || '',
      resolution: ticketData.resolution || '',
      statusId: ticketData.statusId || 0,
      priorityId: ticketData.priorityId || 0,
      issueTypeId: ticketData.issueType || 0,
      subIssueTypeId: ticketData.subIssueType || 0,
      sourceId: ticketData.sourceId || 0,
      queueId: ticketData.queueId || 0,
      workTypeId: ticketData.workTypeId || 0,
      slaId: ticketData.slaId || 0,
      dueDate: dueDateObj ? dueDateObj.toISOString().split('T')[0] : '',
      dueTime: dueDateObj ? dueDateObj.toTimeString().slice(0, 5) : '',
      estimatedHours: ticketData.estimatedHours?.toString() || '',
      partnerTicketNumber: ticketData.partnerTicketNumber || '',
      automaticChaseId: getAutomaticChaseIdFromBoolean(ticketData.automaticChase),
      workedById: getWorkedByIdFromName(workedByName),
      escalationReasonId: getEscalationReasonIdFromName(ticketData.escalationReason || ''),
      ticketCategory: 'Standard',
      ticketType: 'Service Request',
      additionalContacts: '',
      primaryResourceId: typeof ticketData.primaryResource === 'object' ? (ticketData.primaryResource?.id || 0) : 0,
      secondaryResourceIds: [],
      outOfHoursAction: 'Reassign',
      sdmCheck: '',
      contract: '',
      serviceBundle: '',
      imacApproval: '',
      purchaseOrderNumber: '',
    });
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setChecklistItems([]);
  };

  const getAutomaticChaseValue = (automaticChaseId: number): number => {
    if (!metadata?.automaticChase || !automaticChaseId) return 0;
    const selected = metadata.automaticChase.find(item => item.id === automaticChaseId);
    return selected?.name === 'Yes' ? 1 : 0;
  };

  const getWorkedByNameValue = (workedById: number): string => {
    if (!metadata?.workedBy || !workedById) return '';
    const selected = metadata.workedBy.find(item => item.id === workedById);
    return selected?.name || '';
  };

  const getEscalationReasonNameValue = (escalationReasonId: number): string => {
    if (!metadata?.escalationReason || !escalationReasonId) return '';
    const selected = metadata.escalationReason.find(item => item.id === escalationReasonId);
    return selected?.name || '';
  };

  const refetchTicketData = () => {
    if (!id) return;
    
    getTicketByIdAPI(parseInt(id)).subscribe({
      next: (response) => {
        setTicketData(response);
        
        const dueDateObj = response.dueDateTime ? new Date(response.dueDateTime) : null;
        const workedByName = typeof response.workedBy === 'string' 
          ? response.workedBy 
          : response.workedBy?.name || '';
        
        const getAutomaticChaseIdFromBooleanLocal = (automaticChase: boolean | null): number => {
          if (automaticChase === null || automaticChase === undefined) return 0;
          if (!metadata?.automaticChase || !Array.isArray(metadata.automaticChase)) return 0;
          const targetName = automaticChase ? 'Yes' : 'No';
          const found = metadata.automaticChase.find(item => item.name === targetName);
          return found?.id || 0;
        };

        const getWorkedByIdFromNameLocal = (name: string): number => {
          if (!metadata?.workedBy || !name) return 0;
          const selected = metadata.workedBy.find(item => item.name === name);
          return selected?.id || 0;
        };

        const getEscalationReasonIdFromNameLocal = (name: string): number => {
          if (!metadata?.escalationReason || !name) return 0;
          const selected = metadata.escalationReason.find(item => item.name === name);
          return selected?.id || 0;
        };
        
        setEditForm(prev => ({
          ...prev,
          title: response.title || '',
          description: response.description || '',
          statusId: response.statusId || 0,
          priorityId: response.priorityId || 0,
          issueTypeId: response.issueType || 0,
          subIssueTypeId: response.subIssueType || 0,
          queueId: response.queueId || 0,
          sourceId: response.sourceId || 0,
          slaId: response.slaId || 0,
          workTypeId: response.workTypeId || 0,
          dueDate: dueDateObj ? dueDateObj.toISOString().split('T')[0] : '',
          dueTime: dueDateObj ? dueDateObj.toTimeString().slice(0, 5) : '',
          estimatedHours: response.estimatedHours?.toString() || '',
          partnerTicketNumber: response.partnerTicketNumber || '',
          automaticChaseId: getAutomaticChaseIdFromBooleanLocal(response.automaticChase),
          workedById: getWorkedByIdFromNameLocal(workedByName),
          escalationReasonId: getEscalationReasonIdFromNameLocal(response.escalationReason || ''),
        }));
      },
      error: (error) => {
        console.error('Failed to refetch ticket data:', error);
      },
    });
  };

  const handleSave = async (closeAfterSave: boolean = false): Promise<boolean> => {
    if (!ticketData || !id) return false;
    
    setIsSaving(true);
    
    const dueDateTimeStr = editForm.dueDate && editForm.dueTime 
      ? `${editForm.dueDate}T${editForm.dueTime}:00`
      : editForm.dueDate 
        ? `${editForm.dueDate}T00:00:00`
        : '';

    const payload: UpdateTicketPayload = {
      status_id: editForm.statusId,
      priority_id: editForm.priorityId,
      automatic_chase: getAutomaticChaseValue(editForm.automaticChaseId),
      issue_type_id: editForm.issueTypeId,
      sub_issue_type_id: editForm.subIssueTypeId,
      worked_by: getWorkedByNameValue(editForm.workedById),
      escalation_reason: getEscalationReasonNameValue(editForm.escalationReasonId),
      partner_ticket_number: editForm.partnerTicketNumber,
      source_id: editForm.sourceId,
      due_date_time: dueDateTimeStr,
      estimated_hours: parseFloat(editForm.estimatedHours) || 0,
      sla_id: editForm.slaId,
      queue_id: editForm.queueId,
      work_type_id: editForm.workTypeId,
      title: editForm.title,
      description: editForm.description,
    };

    return new Promise((resolve) => {
      updateTicketAPI(parseInt(id), payload).subscribe({
        next: () => {
          toast.success("Changes Saved", {
            description: "Ticket has been updated successfully.",
          });
          refetchTicketData();
          setIsSaving(false);
          if (closeAfterSave) {
            setIsEditMode(false);
          }
          resolve(true);
        },
        error: (error) => {
          console.error('Save failed:', error);
          toast.error("Save Failed", {
            description: "Unable to save changes. Please try again.",
          });
          setIsSaving(false);
          resolve(false);
        },
      });
    });
  };

  const handleSaveAndClose = async () => {
    await handleSave(true);
  };

  const updateFormField = (field: string, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (field === 'issueTypeId') {
      setEditForm(prev => ({ ...prev, subIssueTypeId: 0 }));
    }
  };

  const getSubIssueTypesForIssueType = (issueTypeId: number) => {
    if (!metadata?.subIssueTypeMap || !issueTypeId) return [];
    return metadata.subIssueTypeMap[issueTypeId.toString()] || [];
  };

  const addChecklistItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      completed: false,
      important: false,
    };
    setChecklistItems(prev => [...prev, newItem]);
  };

  const updateChecklistItem = (id: number, field: string, value: string | boolean) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeChecklistItem = (id: number) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
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
  const contactName = ticketData.contact 
    ? `${ticketData.contact.firstName || ''} ${ticketData.contact.lastName || ''}`.trim() || "No Contact"
    : "No Contact";

  return (
    <div className="flex min-h-screen bg-background smooth-transition">
      <Sidebar />
      <TopNavbar />
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} mt-16 bg-background smooth-transition`}>
        {/* Edit Mode Toolbar */}
        {isEditMode && (
          <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#1fb6a6] text-white rounded hover:bg-[#1aa396] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleSaveAndClose}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save & ...
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">Notify Taskfile</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">|</span>
              <button
                onClick={cancelEditMode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Enter Speed Code or Choose Template</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <div className={`${isEditMode ? 'h-[calc(100vh-4rem-52px)]' : 'h-[calc(100vh-4rem)]'} overflow-auto w-full`}>
          <div className="flex gap-0 h-full w-full min-h-full">
            
            {/* LEFT SIDEBAR */}
            <div className="w-[220px] min-w-[220px] flex-shrink-0 bg-card border-r border-border overflow-y-auto">
              {/* Top Section - Company, Contact, Status, Priority */}
              <div className="px-4 pb-4 pt-0 space-y-3">
                {/* Company */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-center">Company{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                  {isEditMode ? (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded text-sm">
                      <span className="flex-1 truncate text-foreground text-xs">{companyName}</span>
                      <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                      <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-center">Contact</p>
                  {isEditMode ? (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-background border border-border rounded text-sm">
                      <span className="flex-1 truncate text-foreground text-xs">{contactName}</span>
                      <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" />
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">{contactName}</p>
                  )}
                </div>

                {/* Status */}
                <div className="w-full">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-center w-full">Status{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                  {isEditMode ? (
                    <select
                      value={editForm.statusId}
                      onChange={(e) => updateFormField('statusId', parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                    >
                      <option value={0}>Select Status</option>
                      {metadata?.status?.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-md text-xs font-bold shadow-sm ${getStatusBadgeColor(statusName)}`}>
                        {statusName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="w-full">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-center w-full">Priority{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                  {isEditMode ? (
                    <select
                      value={editForm.priorityId}
                      onChange={(e) => updateFormField('priorityId', parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                    >
                      <option value={0}>Select Priority</option>
                      {metadata?.priority?.map((priority) => (
                        <option key={priority.id} value={priority.id}>{priority.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-md text-xs font-bold shadow-sm ${getPriorityBadgeColor(priorityName)}`}>
                        {priorityName}
                      </span>
                    </div>
                  )}
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
                    {/* Automatic chase? */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Automatic chase?</p>
                      {isEditMode ? (
                        <select
                          value={editForm.automaticChaseId}
                          onChange={(e) => updateFormField('automaticChaseId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Automatic Chase</option>
                          {metadata?.automaticChase?.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getAutomaticChaseDisplayName()}</p>
                      )}
                    </div>

                    {/* Issue Type */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Issue Type{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                      {isEditMode ? (
                        <select
                          value={editForm.issueTypeId}
                          onChange={(e) => updateFormField('issueTypeId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Issue Type</option>
                          {metadata?.issueType?.map((issueType) => (
                            <option key={issueType.id} value={issueType.id}>{issueType.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getIssueTypeName(ticketData.issueType)}</p>
                      )}
                    </div>

                    {/* Sub-Issue Type */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sub-Issue Type{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                      {isEditMode ? (
                        <select
                          value={editForm.subIssueTypeId}
                          onChange={(e) => updateFormField('subIssueTypeId', parseInt(e.target.value))}
                          disabled={!editForm.issueTypeId}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6] disabled:opacity-50"
                        >
                          <option value={0}>Select Sub-Issue Type</option>
                          {getSubIssueTypesForIssueType(editForm.issueTypeId).map((subIssue) => (
                            <option key={subIssue.id} value={subIssue.id}>{subIssue.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getSubIssueTypeName(ticketData.subIssueType)}</p>
                      )}
                    </div>

                    {/* Worked by */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Worked by</p>
                      {isEditMode ? (
                        <select
                          value={editForm.workedById}
                          onChange={(e) => updateFormField('workedById', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Worked By</option>
                          {metadata?.workedBy?.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getWorkedByDisplayName()}</p>
                      )}
                    </div>

                    {/* Escalation Reason */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Escalation Reason</p>
                      {isEditMode ? (
                        <select
                          value={editForm.escalationReasonId}
                          onChange={(e) => updateFormField('escalationReasonId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Escalation Reason</option>
                          {metadata?.escalationReason?.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getEscalationReasonDisplayName()}</p>
                      )}
                    </div>

                    {/* Partner Ticket Number */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Partner Ticket Number</p>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editForm.partnerTicketNumber}
                          onChange={(e) => updateFormField('partnerTicketNumber', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          placeholder="Enter ticket number"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{ticketData.partnerTicketNumber || "N/A"}</p>
                      )}
                    </div>

                    {/* Source */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Source{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                      {isEditMode ? (
                        <select
                          value={editForm.sourceId}
                          onChange={(e) => updateFormField('sourceId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Source</option>
                          {metadata?.source?.map((source) => (
                            <option key={source.id} value={source.id}>{source.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getSourceName(ticketData.sourceId)}</p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Due Date{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                      {isEditMode ? (
                        <div className="space-y-1">
                          <input
                            type="date"
                            value={editForm.dueDate}
                            onChange={(e) => updateFormField('dueDate', e.target.value)}
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          />
                          <input
                            type="time"
                            value={editForm.dueTime}
                            onChange={(e) => updateFormField('dueTime', e.target.value)}
                            className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-[#ee754e]">{formatShortDate(ticketData.dueDateTime)}</p>
                      )}
                    </div>

                    {/* Estimated Hours - Edit mode only */}
                    {isEditMode && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Estimated Hours</p>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.estimatedHours}
                          onChange={(e) => updateFormField('estimatedHours', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {/* Service Level Agreement */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Service Level Agreement</p>
                      {isEditMode ? (
                        <select
                          value={editForm.slaId}
                          onChange={(e) => updateFormField('slaId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select SLA</option>
                          {metadata?.sla?.map((sla) => (
                            <option key={sla.id} value={sla.id}>{sla.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getSlaName(ticketData.slaId)}</p>
                      )}
                    </div>

                    {/* Additional Contacts - Edit mode only */}
                    {isEditMode && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Additional Contacts</p>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editForm.additionalContacts}
                            onChange={(e) => updateFormField('additionalContacts', e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                            placeholder="Type to search..."
                          />
                          <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                        </div>
                      </div>
                    )}

                    {/* Work Type - View mode only */}
                    {!isEditMode && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Work Type</p>
                        <p className="text-sm font-semibold text-foreground">{getWorkTypeName(ticketData.workTypeId)}</p>
                      </div>
                    )}

                    {/* Queue - View mode only */}
                    {!isEditMode && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Queue</p>
                        <p className="text-sm font-semibold text-foreground">{getQueueName(ticketData.queueId)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assignment Section */}
              <div className="border-t border-border">
                <button
                  onClick={() => setIsAssignmentExpanded(!isAssignmentExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Assignment</span>
                  {isAssignmentExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isAssignmentExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Queue */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Queue</p>
                      {isEditMode ? (
                        <select
                          value={editForm.queueId}
                          onChange={(e) => updateFormField('queueId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Queue</option>
                          {metadata?.queue?.map((queue) => (
                            <option key={queue.id} value={queue.id}>{queue.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#1fb6a6] text-white shadow-sm">
                          {getQueueName(ticketData.queueId)}
                        </span>
                      )}
                    </div>

                    {/* Primary Resource */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Primary Resource (Role)</p>
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded text-sm">
                              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
                                {getResourceName(ticketData.primaryResource)?.substring(0, 2).toUpperCase() || 'NA'}
                              </div>
                              <span className="flex-1 truncate text-foreground">{getResourceName(ticketData.primaryResource)}</span>
                              <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                            </div>
                            <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                            <button className="p-1.5 border border-border rounded hover:bg-accent"><FileText className="h-3 w-3" /></button>
                            <button className="p-1.5 border border-border rounded hover:bg-accent"><Plus className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {getResourceName(ticketData.primaryResource)?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">{getResourceName(ticketData.primaryResource)}</span>
                              <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                            </div>
                            <p className="text-xs text-muted-foreground">(Desktop Engineer)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Secondary Resources */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Secondary Resources (Role)</p>
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Type to search..."
                              className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                            />
                            <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                          </div>
                          {ticketData.secondaryResource && ticketData.secondaryResource.length > 0 && (
                            <div className="space-y-1">
                              {ticketData.secondaryResource.map((resource, index) => (
                                <div key={index} className="flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded text-sm">
                                  <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[8px] font-bold">
                                    {getResourceName(resource)?.substring(0, 2).toUpperCase() || 'NA'}
                                  </div>
                                  <span className="flex-1 truncate text-foreground">{getResourceName(resource)}</span>
                                  <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        ticketData.secondaryResource && ticketData.secondaryResource.length > 0 ? (
                          ticketData.secondaryResource.map((resource, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center text-white text-[10px] font-bold">
                                {getResourceName(resource)?.substring(0, 2).toUpperCase() || 'NA'}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">{getResourceName(resource)}</span>
                                <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">None assigned</p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration Item Section (Left Sidebar) */}
              <div className="border-t border-border">
                <button
                  onClick={() => setIsConfigItemExpanded(!isConfigItemExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Configuration Item</span>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Billing Section */}
              <div className="border-t border-border">
                <button
                  onClick={() => setIsBillingExpanded(!isBillingExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Billing</span>
                  {isBillingExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isBillingExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Contract */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Contract</p>
                      {isEditMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editForm.contract || ''}
                            onChange={(e) => updateFormField('contract', e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                            placeholder="Type to search..."
                          />
                          <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{ticketData.contractId || 'N/A'}</p>
                      )}
                    </div>

                    {/* Service/Bundle */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Service/Bundle</p>
                      {isEditMode ? (
                        <select
                          value={editForm.serviceBundle || ''}
                          onChange={(e) => updateFormField('serviceBundle', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value="">Choose Contract</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">N/A</p>
                      )}
                    </div>

                    {/* Work Type */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Work Type{isEditMode && <span className="text-[#ee754e]">*</span>}</p>
                      {isEditMode ? (
                        <select
                          value={editForm.workTypeId}
                          onChange={(e) => updateFormField('workTypeId', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value={0}>Select Work Type</option>
                          {metadata?.workType?.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{getWorkTypeName(ticketData.workTypeId)}</p>
                      )}
                    </div>

                    {/* IMAC Approval Received */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">IMAC Approval Received</p>
                      {isEditMode ? (
                        <select
                          value={editForm.imacApproval || ''}
                          onChange={(e) => updateFormField('imacApproval', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value=""></option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">N/A</p>
                      )}
                    </div>

                    {/* Purchase Order Number */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Purchase Order Number</p>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editForm.purchaseOrderNumber || ''}
                          onChange={(e) => updateFormField('purchaseOrderNumber', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          placeholder=""
                        />
                      ) : (
                        <p className="text-sm font-semibold text-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User-Defined Fields Section */}
              <div className="border-t border-border">
                <button
                  onClick={() => setIsUserDefinedExpanded(!isUserDefinedExpanded)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">User-Defined Fields</span>
                  {isUserDefinedExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isUserDefinedExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Out of Hours action */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Out of Hours action</p>
                      {isEditMode ? (
                        <select
                          value={editForm.outOfHoursAction}
                          onChange={(e) => updateFormField('outOfHoursAction', e.target.value)}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                        >
                          <option value="Reassign">Reassign</option>
                          <option value="Leave Assigned">Leave Assigned</option>
                          <option value="Escalate">Escalate</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">Reassign</p>
                      )}
                    </div>

                    {/* SDM Check */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">SDM Check</p>
                      {isEditMode ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editForm.sdmCheck}
                            onChange={(e) => updateFormField('sdmCheck', e.target.value)}
                            className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                            placeholder=""
                          />
                          <button className="p-1.5 border border-border rounded hover:bg-accent"><Calendar className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 bg-background px-6 pb-6 pt-0 overflow-auto">
              {/* View Mode Toolbar */}
              {!isEditMode && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <button
                    onClick={enterEditMode}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                    <ChevronRight className="h-4 w-4" />
                    Forward
                  </button>
                  <div className="relative">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                      Tools
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                    <Check className="h-4 w-4" />
                    Complete
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#ee754e] to-[#f49b71]">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    {isEditMode ? (
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ticket Category</p>
                          <select
                            value={editForm.ticketCategory}
                            onChange={(e) => updateFormField('ticketCategory', e.target.value)}
                            className="px-2 py-1 bg-[#1fb6a6] text-white text-xs font-medium rounded focus:outline-none"
                          >
                            <option value="Standard">Standard</option>
                            <option value="Incident">Incident</option>
                            <option value="Problem">Problem</option>
                            <option value="Change Request">Change Request</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ticket Type<span className="text-[#ee754e]">*</span></p>
                          <select
                            value={editForm.ticketType}
                            onChange={(e) => updateFormField('ticketType', e.target.value)}
                            className="px-2 py-1 bg-background border border-border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                          >
                            <option value="Service Request">Service Request</option>
                            <option value="Incident">Incident</option>
                            <option value="Problem">Problem</option>
                            <option value="Change Request">Change Request</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#1fb6a6] text-white text-xs font-medium rounded">Standard</span>
                        <span className="px-2 py-0.5 bg-[#ee754e] text-white text-xs font-medium rounded">Service Request</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground">{ticketData.ticketNumber}</h1>
                    </div>
                  </div>
                </div>
                
              </div>

              {/* Title */}
              <div className="mb-2">
                {isEditMode ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Title<span className="text-[#ee754e]">*</span></p>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => updateFormField('title', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-lg font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                      placeholder="Enter ticket title"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-foreground">[{ticketData.title.replace(/^\[|\]$/g, '')}]</h2>
                )}
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
                    {isEditMode ? (
                      <div>
                        {/* Rich Text Toolbar */}
                        <div className="flex items-center gap-1 mb-2 p-2 border border-border rounded-t bg-accent/20">
                          <button className="p-1.5 hover:bg-accent rounded"><Bold className="h-4 w-4" /></button>
                          <button className="p-1.5 hover:bg-accent rounded"><Italic className="h-4 w-4" /></button>
                          <button className="p-1.5 hover:bg-accent rounded"><Underline className="h-4 w-4" /></button>
                          <span className="w-px h-5 bg-border mx-1" />
                          <button className="p-1.5 hover:bg-accent rounded"><List className="h-4 w-4" /></button>
                          <button className="p-1.5 hover:bg-accent rounded"><ListOrdered className="h-4 w-4" /></button>
                          <span className="w-px h-5 bg-border mx-1" />
                          <button className="p-1.5 hover:bg-accent rounded"><Image className="h-4 w-4" /></button>
                        </div>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => updateFormField('description', e.target.value)}
                          rows={8}
                          className="w-full px-4 py-3 bg-background border border-t-0 border-border rounded-b text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6] resize-none"
                          placeholder="Enter description..."
                        />
                      </div>
                    ) : (
                      <div className="bg-background rounded-lg p-4 border border-border text-left">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed text-left">
                          {ticketData.description || "No description available."}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist Section - Edit Mode Only */}
              {isEditMode && (
                <div className="border border-border rounded-lg mb-4 bg-card">
                  <button
                    onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-accent/30 smooth-transition"
                  >
                    {isChecklistExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">Checklist</span>
                  </button>
                  {isChecklistExpanded && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-3">You may enter up to 100 total items.</p>
                      
                      {/* Checklist Actions */}
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={addChecklistItem}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          New Checklist Item
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                          Add from Library
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                          Save to Library
                        </button>
                      </div>
                      
                      {/* Checklist Table Header */}
                      <div className="flex items-center gap-4 px-2 py-2 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                        <div className="w-8"><input type="checkbox" className="rounded" /></div>
                        <div className="w-20">Completed</div>
                        <div className="flex-1">Item Name</div>
                        <div className="w-20">Important</div>
                        <div className="w-8"></div>
                      </div>
                      
                      {/* Checklist Items */}
                      {checklistItems.length === 0 ? (
                        <div className="py-8 text-center text-[#ee754e]">
                          No items to display
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {checklistItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 px-2 py-2">
                              <div className="w-8"><input type="checkbox" className="rounded" /></div>
                              <div className="w-20">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={(e) => updateChecklistItem(item.id, 'completed', e.target.checked)}
                                  className="rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => updateChecklistItem(item.id, 'name', e.target.value)}
                                  className="w-full px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                                  placeholder="Enter item name..."
                                />
                              </div>
                              <div className="w-20">
                                <input
                                  type="checkbox"
                                  checked={item.important}
                                  onChange={(e) => updateChecklistItem(item.id, 'important', e.target.checked)}
                                  className="rounded"
                                />
                              </div>
                              <div className="w-8">
                                <button
                                  onClick={() => removeChecklistItem(item.id)}
                                  className="p-1 text-muted-foreground hover:text-[#ee754e] transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                        style={{ width: `calc(${getTimelineProgress()}% - 20px)` }}
                      />
                      
                      {/* Gray Line (pending portion) */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-gray-300 rounded-full right-[40px]"
                        style={{ left: `calc(${getTimelineProgress()}% + 32px)`, width: `calc(${100 - getTimelineProgress()}% - 72px)` }}
                      />

                      {/* Milestone Points */}
                      <div className="relative flex justify-between items-center px-6">
                        {getTimelineMilestones().map((milestone) => (
                          <div
                            key={milestone.id}
                            className="relative flex flex-col items-center"
                            onMouseEnter={() => setHoveredMilestone(milestone.id)}
                            onMouseLeave={() => setHoveredMilestone(null)}
                          >
                            {/* Tooltip */}
                            {hoveredMilestone === milestone.id && (
                              <div className="absolute bottom-full mb-3 z-20">
                                <div className="bg-[#1a2332] text-white px-4 py-3 rounded-lg shadow-xl min-w-[180px] text-center">
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
                                    <p className="text-xs text-gray-400 mb-1">{milestone.subLabel}</p>
                                  )}
                                  <p className="text-xs text-gray-300">{milestone.date}</p>
                                  {milestone.targetDate && milestone.actualDate && milestone.type !== 'sla' && (
                                    <div className="mt-2 pt-2 border-t border-gray-600">
                                      <p className="text-[10px] text-gray-400">Target: {formatTimelineDate(milestone.targetDate)}</p>
                                      <p className="text-[10px] text-[#1fb6a6]">Actual: {formatTimelineDate(milestone.actualDate)}</p>
                                    </div>
                                  )}
                                  {milestone.targetDate && !milestone.actualDate && milestone.type !== 'sla' && (
                                    <div className="mt-2 pt-2 border-t border-gray-600">
                                      <p className="text-[10px] text-gray-400">Target: {formatTimelineDate(milestone.targetDate)}</p>
                                      <p className="text-[10px] text-amber-400">Pending</p>
                                    </div>
                                  )}
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

                            {/* Label under milestone */}
                            <span className="absolute -bottom-6 text-[10px] text-muted-foreground whitespace-nowrap">
                              {milestone.label}
                            </span>
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
                  <button 
                    onClick={() => setActiveActivityTab('activity')}
                    className={`px-4 py-3 text-sm font-medium ${activeActivityTab === 'activity' ? 'text-[#1fb6a6] border-b-2 border-[#1fb6a6]' : 'text-muted-foreground hover:text-foreground'} smooth-transition`}
                  >
                    Activity
                  </button>
                  <button 
                    onClick={() => setActiveActivityTab('attachments')}
                    className={`px-4 py-3 text-sm font-medium ${activeActivityTab === 'attachments' ? 'text-[#1fb6a6] border-b-2 border-[#1fb6a6]' : 'text-muted-foreground hover:text-foreground'} smooth-transition`}
                  >
                    Attachments ({getAttachmentCount()})
                  </button>
                  <button 
                    onClick={() => setActiveActivityTab('charges')}
                    className={`px-4 py-3 text-sm font-medium ${activeActivityTab === 'charges' ? 'text-[#1fb6a6] border-b-2 border-[#1fb6a6]' : 'text-muted-foreground hover:text-foreground'} smooth-transition`}
                  >
                    Charges & Expenses (0)
                  </button>
                  <button 
                    onClick={() => setActiveActivityTab('serviceCalls')}
                    className={`px-4 py-3 text-sm font-medium ${activeActivityTab === 'serviceCalls' ? 'text-[#1fb6a6] border-b-2 border-[#1fb6a6]' : 'text-muted-foreground hover:text-foreground'} smooth-transition`}
                  >
                    Service Calls & To-Dos (0)
                  </button>
                </div>

                {/* Activity Tab Content */}
                {activeActivityTab === 'activity' && (
                  <div className="p-4">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-4">
                      <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent/30 transition-colors">
                        <Clock className="h-4 w-4" />
                        New Time Entry
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent/30 transition-colors">
                        <FileText className="h-4 w-4" />
                        New Note
                      </button>
                      <button 
                        onClick={() => setIsNewAttachmentModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent/30 transition-colors"
                      >
                        <Paperclip className="h-4 w-4" />
                        New Attachment
                      </button>
                      <button className="p-2 border border-border rounded-md text-muted-foreground hover:bg-accent/30 transition-colors">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Note Input */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#1fb6a6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        DS
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add a note..." 
                        className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30"
                      />
                      <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed">
                        Minutes
                      </button>
                    </div>

                    {/* Checkboxes and Filter */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={showSystemNotes}
                            onChange={(e) => setShowSystemNotes(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-[#1fb6a6] focus:ring-[#1fb6a6]"
                          />
                          <span className="text-sm text-foreground">Show System Notes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={showBillingData}
                            onChange={(e) => setShowBillingData(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-[#1fb6a6] focus:ring-[#1fb6a6]"
                          />
                          <span className="text-sm text-foreground">Show Billing Data</span>
                        </label>
                      </div>
                    </div>

                    {/* Filter and Search Row */}
                    <div className="flex items-center justify-between mb-4 border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filter</span>
                        <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-xs text-muted-foreground">0</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-9 pr-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 w-48"
                          />
                        </div>
                        <select className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30">
                          <option>Newest First with Escalation</option>
                          <option>Newest First</option>
                          <option>Oldest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Activity Entries */}
                    <div className="space-y-4">
                      {isNotesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 text-[#1fb6a6] animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading notes...</span>
                        </div>
                      ) : getFilteredNotes().length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No activity to display</p>
                        </div>
                      ) : (
                        getFilteredNotes().map((note) => (
                          <div key={note.id} className="flex gap-3 p-3 bg-background rounded-lg border border-border">
                            <div className={`w-8 h-8 rounded-full ${note.noteTypeId === 13 ? 'bg-gray-500' : 'bg-purple-500'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                              {getCreatorInitials(note.creator)}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                {note.creator ? (
                                  <>
                                    <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">
                                      {typeof note.creator === 'object' ? note.creator.name : note.creator}
                                    </span>
                                    <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-muted-foreground">System</span>
                                )}
                              </div>
                              <p className="text-sm text-foreground font-medium mb-1">{note.title}</p>
                              {note.description !== note.title && (
                                <p className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap">{note.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mb-2">{formatNoteDate(note.createDateTime)}</p>
                              
                              {/* Attachments */}
                              {note.attachments && note.attachments.length > 0 && (
                                <div className="mb-2">
                                  {note.attachments.map((attachment) => {
                                    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachment.fileName);
                                    return isImage && attachment.imageUrl ? (
                                      <div key={attachment.id} className="mb-2">
                                        <img 
                                          src={attachment.imageUrl} 
                                          alt={attachment.fileName}
                                          className="w-full max-w-[500px] rounded-lg border border-border"
                                        />
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                          <span>{attachment.fileName}</span>
                                          <span>Size (KB)</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div key={attachment.id} className="flex items-center gap-1 px-2 py-1 bg-accent/30 rounded text-xs mb-1">
                                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-foreground">{attachment.fileName}</span>
                                        <span className="text-muted-foreground">({Math.round(attachment.fileSize / 1024)}KB)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#1fb6a6] hover:underline cursor-pointer">note</span>
                                <span className="text-xs text-[#1fb6a6] hover:underline cursor-pointer">time</span>
                                {note.attachments && note.attachments.length > 0 && (
                                  <span className="text-xs text-[#1fb6a6] hover:underline cursor-pointer">attachment</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments Tab Content */}
                {activeActivityTab === 'attachments' && (
                  <div className="p-4">
                    {isNotesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 text-[#1fb6a6] animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading attachments...</span>
                      </div>
                    ) : getAttachmentCount() === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No attachments to display</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ticketNotes.filter(note => note.attachments && note.attachments.length > 0).map((note) => (
                          note.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                              <div className="w-10 h-10 rounded bg-accent/30 flex items-center justify-center flex-shrink-0">
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-foreground">{attachment.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(attachment.fileSize / 1024)}KB • {formatNoteDate(attachment.createdDateTime)}
                                </p>
                              </div>
                              <button className="px-3 py-1.5 text-xs font-medium text-[#1fb6a6] border border-[#1fb6a6] rounded hover:bg-[#1fb6a6]/10 transition-colors">
                                Download
                              </button>
                            </div>
                          ))
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeActivityTab === 'charges' && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No charges & expenses to display</p>
                  </div>
                )}
                {activeActivityTab === 'serviceCalls' && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No service calls & to-dos to display</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-[220px] min-w-[220px] flex-shrink-0 bg-card border-l border-border overflow-y-auto">
              {/* Company/Contact Section */}
              <div className="border-b border-border">
                <button
                  onClick={() => setIsCompanyContactExpanded(!isCompanyContactExpanded)}
                  className="flex items-center justify-between w-full px-5 pt-0 pb-3.5 text-left hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">Company/Contact</span>
                  {isCompanyContactExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isCompanyContactExpanded && (
                  <div className="px-5 pb-5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>Manager: Autotask Administrator</span>
                      <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                    </div>
                    <span className="text-sm text-[#1fb6a6] hover:underline cursor-pointer">Site Configuration</span>
                    
                    <div className="pt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">First Floor, Saxon House</p>
                      <p className="text-sm text-muted-foreground">Crawley, Suffolk RH10 1 TN</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    
                    {ticketData.partnerCompany?.phoneNumber && (
                      <p className="text-sm text-muted-foreground">{ticketData.partnerCompany.phoneNumber}</p>
                    )}
                    
                    <div className="space-y-1 pt-1">
                      <p className="text-sm">
                        <span className="text-[#1fb6a6] hover:underline cursor-pointer">All Open Tickets</span>
                        <span className="text-muted-foreground"> (43 + 2)</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-[#1fb6a6] hover:underline cursor-pointer">Last 30 Days</span>
                        <span className="text-muted-foreground"> (9 + 0)</span>
                      </p>
                    </div>
                    
                    <div className="border-t border-border pt-3 mt-3">
                      {ticketData.contact ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">
                              {ticketData.contact.firstName} {ticketData.contact.lastName}
                            </span>
                            <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                          </div>
                          {ticketData.contact.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{ticketData.contact.phoneNumber}</span>
                            </div>
                          )}
                          {ticketData.contact.mobileNumber && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{ticketData.contact.mobileNumber}</span>
                            </div>
                          )}
                          {ticketData.contact.email1 && (
                            <p className="text-sm text-[#1fb6a6] hover:underline cursor-pointer truncate">{ticketData.contact.email1}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No Contact</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-[#1fb6a6] cursor-pointer" />
                    </div>
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
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Worked</p>
                        <p className="text-2xl font-bold text-foreground">0</p>
                      </div>
                      <div className="py-2 border-l border-border pl-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Estimated</p>
                        <p className="text-2xl font-bold text-foreground">2h</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                      <div className="h-full bg-[#1fb6a6] rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground font-medium">2h Remaining</p>
                    
                    <div className="flex justify-end pt-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-[#1fb6a6] cursor-pointer" />
                    </div>
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
                    <p className="text-sm text-muted-foreground">Nothing to display</p>
                    <div className="flex justify-end pt-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-[#1fb6a6] cursor-pointer" />
                    </div>
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
                  <div className="px-5 pb-5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer transition-colors">{companyName}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Number: {ticketData.partnerCompany?.autotaskId || 0}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>Manager: Autotask Administrator</span>
                      <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                    </div>
                    
                    <span className="text-sm text-[#1fb6a6] hover:underline cursor-pointer block">Site Configuration</span>
                    
                    <div className="pt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">First Floor, Saxon House</p>
                      <p className="text-sm text-muted-foreground">Crawley, Suffolk RH10 1 TN</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    
                    {ticketData.partnerCompany?.phoneNumber && (
                      <p className="text-sm text-muted-foreground">{ticketData.partnerCompany.phoneNumber}</p>
                    )}
                    
                    <div className="space-y-1 pt-1">
                      <p className="text-sm">
                        <span className="text-[#1fb6a6] hover:underline cursor-pointer">All Open Tickets</span>
                        <span className="text-muted-foreground"> (43 + 2)</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-[#1fb6a6] hover:underline cursor-pointer">Last 30 Days</span>
                        <span className="text-muted-foreground"> (9 + 0)</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Attachment Modal */}
      {isNewAttachmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-[500px] max-w-[90vw]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">New Attachment</h3>
              <button
                onClick={() => setIsNewAttachmentModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                  <Save className="h-4 w-4" />
                  Save & Close
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-accent transition-colors">
                  <Save className="h-4 w-4" />
                  Save & New
                </button>
                <button
                  onClick={() => setIsNewAttachmentModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                <select
                  value={newAttachment.type}
                  onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30"
                >
                  <option value="Attachment (10 MB maximum)">Attachment (10 MB maximum)</option>
                  <option value="Document (20 MB maximum)">Document (20 MB maximum)</option>
                </select>
              </div>

              {/* File Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  File <span className="text-[#ee754e]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewAttachment({ ...newAttachment, file, name: file?.name || '' });
                    }}
                    className="hidden"
                    id="attachment-file-input"
                  />
                  <label
                    htmlFor="attachment-file-input"
                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded text-sm text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    {newAttachment.file ? newAttachment.file.name : 'No file chosen'}
                  </label>
                </div>
                
                {/* Image Preview */}
                {newAttachment.file && /\.(jpg|jpeg|png|gif|webp)$/i.test(newAttachment.file.name) && (
                  <div className="mt-3 border border-border rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(newAttachment.file)}
                      alt="Preview"
                      className="w-full max-h-[300px] object-contain"
                    />
                    <div className="flex items-center justify-between px-3 py-2 bg-accent/30 text-xs text-muted-foreground">
                      <span>File/Folder/URL</span>
                      <span>Size (KB)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name <span className="text-[#ee754e]">*</span>
                </label>
                <input
                  type="text"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  placeholder="Enter attachment name"
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
