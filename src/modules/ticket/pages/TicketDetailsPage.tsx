import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/store-hooks";
import { getMetadata } from "@/app/redux/metadataSlice";
import { getTicketByIdAPI, getTicketNotesAPI, getTicketTimeEntriesAPI, updateTicketAPI, createTicketNoteAPI, createTimeEntryAPI, toggleNotePinAPI, searchUsersAPI, type TicketDetails, type TicketNote, type TimeEntry, type UpdateTicketPayload, type CreateNotePayload, type CreateTimeEntryPayload, type UserSearchResult } from "@/services/api/ticket-api";
import { forkJoin } from "rxjs";

type ActivityItem = 
  | (TicketNote & { type: 'note' })
  | (TimeEntry & { type: 'timeEntry' });

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const metadata = useAppSelector(getMetadata);
  const [ticketData, setTicketData] = useState<TicketDetails | null>(null);
  const [ticketNotes, setTicketNotes] = useState<TicketNote[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
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
  
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    noteTypeId: 1,
    publishTypeId: 1,
  });
  const noteDescriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const [isNewTimeEntryModalOpen, setIsNewTimeEntryModalOpen] = useState(false);
  const [isSavingTimeEntry, setIsSavingTimeEntry] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    timeWorkedHours: 0,
    timeWorkedMinutes: 0,
  });
  const summaryNotesRef = useRef<HTMLTextAreaElement>(null);
  
  const [isPinConfirmOpen, setIsPinConfirmOpen] = useState(false);
  const [pinningNoteId, setPinningNoteId] = useState<number | null>(null);
  const [isTogglingPin, setIsTogglingPin] = useState(false);
  
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

  const [primaryResourceSearch, setPrimaryResourceSearch] = useState('');
  const [primaryResourceResults, setPrimaryResourceResults] = useState<UserSearchResult[]>([]);
  const [isPrimaryResourceDropdownOpen, setIsPrimaryResourceDropdownOpen] = useState(false);
  const [isSearchingPrimaryResource, setIsSearchingPrimaryResource] = useState(false);
  const [selectedPrimaryResource, setSelectedPrimaryResource] = useState<UserSearchResult | null>(null);
  
  const [secondaryResourceSearch, setSecondaryResourceSearch] = useState('');
  const [secondaryResourceResults, setSecondaryResourceResults] = useState<UserSearchResult[]>([]);
  const [isSecondaryResourceDropdownOpen, setIsSecondaryResourceDropdownOpen] = useState(false);
  const [isSearchingSecondaryResource, setIsSearchingSecondaryResource] = useState(false);
  const [selectedSecondaryResources, setSelectedSecondaryResources] = useState<UserSearchResult[]>([]);

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
        forkJoin({
          notes: getTicketNotesAPI(ticketId),
          timeEntries: getTicketTimeEntriesAPI(ticketId)
        }).subscribe({
          next: ({ notes, timeEntries }) => {
            console.log("[TicketDetails] Notes received:", notes);
            console.log("[TicketDetails] Time entries received:", timeEntries);
            setTicketNotes(notes);
            
            const notesWithType: ActivityItem[] = notes.map(note => ({ ...note, type: 'note' as const }));
            const timeEntriesWithType: ActivityItem[] = timeEntries.map(entry => ({ ...entry, type: 'timeEntry' as const }));
            
            const merged = [...notesWithType, ...timeEntriesWithType];
            merged.sort((a, b) => new Date(b.createDateTime).getTime() - new Date(a.createDateTime).getTime());
            
            setActivityItems(merged);
            setIsNotesLoading(false);
          },
          error: (error) => {
            console.error("Error fetching activity data:", error);
            setIsNotesLoading(false);
          },
        });
      }
    }
  }, [id]);

  const refetchActivity = () => {
    if (id) {
      const ticketId = parseInt(id, 10);
      if (!isNaN(ticketId)) {
        setIsNotesLoading(true);
        forkJoin({
          notes: getTicketNotesAPI(ticketId),
          timeEntries: getTicketTimeEntriesAPI(ticketId)
        }).subscribe({
          next: ({ notes, timeEntries }) => {
            setTicketNotes(notes);
            
            const notesWithType: ActivityItem[] = notes.map(note => ({ ...note, type: 'note' as const }));
            const timeEntriesWithType: ActivityItem[] = timeEntries.map(entry => ({ ...entry, type: 'timeEntry' as const }));
            
            const merged = [...notesWithType, ...timeEntriesWithType];
            merged.sort((a, b) => new Date(b.createDateTime).getTime() - new Date(a.createDateTime).getTime());
            
            setActivityItems(merged);
            setIsNotesLoading(false);
          },
          error: (error) => {
            console.error("Error fetching activity data:", error);
            setIsNotesLoading(false);
          },
        });
      }
    }
  };

  const handleSaveNote = (closeModal: boolean) => {
    const noteDescription = noteDescriptionRef.current?.value || '';
    
    if (!id || !newNote.title.trim() || !noteDescription.trim()) {
      toast.error("Validation Error", {
        description: "Title and Description are required.",
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) return;

    setIsSavingNote(true);

    const payload: CreateNotePayload = {
      title: newNote.title,
      description: noteDescription,
      note_type: newNote.noteTypeId,
      publish: newNote.publishTypeId,
    };

    createTicketNoteAPI(ticketId, payload).subscribe({
      next: () => {
        toast.success("Note Created", {
          description: "Your note has been added successfully.",
        });
        setIsSavingNote(false);
        refetchActivity();
        if (closeModal) {
          setIsNewNoteModalOpen(false);
        }
        setNewNote({ title: '', noteTypeId: 1, publishTypeId: 1 });
        if (noteDescriptionRef.current) noteDescriptionRef.current.value = '';
      },
      error: (error) => {
        console.error("Error creating note:", error);
        toast.error("Failed to Create Note", {
          description: "Unable to save note. Please try again.",
          icon: <AlertCircle className="h-5 w-5" />,
        });
        setIsSavingNote(false);
      },
    });
  };

  const calculateTimeWorked = (start: string, end: string) => {
    if (!start || !end) return;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setNewTimeEntry(prev => ({ ...prev, timeWorkedHours: hours, timeWorkedMinutes: minutes }));
  };

  const handleSaveTimeEntry = (keepOpen: boolean = false) => {
    if (!id) return;
    
    const summaryNotes = summaryNotesRef.current?.value || '';
    
    if (!summaryNotes.trim()) {
      toast.error("Summary Notes is required");
      return;
    }
    if (!newTimeEntry.date) {
      toast.error("Date is required");
      return;
    }
    if (!newTimeEntry.startTime || !newTimeEntry.endTime) {
      toast.error("Start Time and End Time are required");
      return;
    }

    setIsSavingTimeEntry(true);

    const hoursWorked = newTimeEntry.timeWorkedHours + (newTimeEntry.timeWorkedMinutes / 60);
    
    const startDateTime = `${newTimeEntry.date}T${newTimeEntry.startTime}:00Z`;
    const endDateTime = `${newTimeEntry.date}T${newTimeEntry.endTime}:00Z`;

    const payload: CreateTimeEntryPayload = {
      summary_notes: summaryNotes,
      date_worked: newTimeEntry.date,
      hours_worked: parseFloat(hoursWorked.toFixed(2)),
      start_datetime: startDateTime,
      end_datetime: endDateTime,
    };

    createTimeEntryAPI(parseInt(id), payload).subscribe({
      next: () => {
        toast.success("Time entry created successfully");
        refetchActivity();
        if (!keepOpen) {
          setIsNewTimeEntryModalOpen(false);
        }
        setNewTimeEntry({
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          timeWorkedHours: 0,
          timeWorkedMinutes: 0,
        });
        if (summaryNotesRef.current) summaryNotesRef.current.value = '';
        setIsSavingTimeEntry(false);
      },
      error: (error) => {
        console.error("Failed to create time entry:", error);
        toast.error("Failed to create time entry");
        setIsSavingTimeEntry(false);
      },
    });
  };

  const handlePinClick = (noteId: number) => {
    setPinningNoteId(noteId);
    setIsPinConfirmOpen(true);
  };

  const handleConfirmPin = () => {
    if (!id || !pinningNoteId) return;
    
    setIsTogglingPin(true);
    toggleNotePinAPI(parseInt(id), pinningNoteId).subscribe({
      next: () => {
        toast.success("Note pin status updated");
        refetchActivity();
        setIsPinConfirmOpen(false);
        setPinningNoteId(null);
        setIsTogglingPin(false);
      },
      error: (error) => {
        console.error("Failed to toggle pin:", error);
        toast.error("Failed to update pin status");
        setIsTogglingPin(false);
      },
    });
  };

  const handlePrimaryResourceSearch = (query: string) => {
    setPrimaryResourceSearch(query);
    if (query.length >= 2) {
      setIsSearchingPrimaryResource(true);
      setIsPrimaryResourceDropdownOpen(true);
      searchUsersAPI(query).subscribe({
        next: (results) => {
          setPrimaryResourceResults(results);
          setIsSearchingPrimaryResource(false);
        },
        error: (error) => {
          console.error("Failed to search users:", error);
          setPrimaryResourceResults([]);
          setIsSearchingPrimaryResource(false);
        },
      });
    } else {
      setPrimaryResourceResults([]);
      setIsPrimaryResourceDropdownOpen(false);
    }
  };

  const handleSelectPrimaryResource = (user: UserSearchResult) => {
    setSelectedPrimaryResource(user);
    setPrimaryResourceSearch('');
    setPrimaryResourceResults([]);
    setIsPrimaryResourceDropdownOpen(false);
    // Remove from secondary resources if already selected
    setSelectedSecondaryResources(prev => prev.filter(r => r.id !== user.id));
  };

  const handleRemovePrimaryResource = () => {
    setSelectedPrimaryResource(null);
  };

  const handleSecondaryResourceSearch = (query: string) => {
    setSecondaryResourceSearch(query);
    if (query.length >= 2) {
      setIsSearchingSecondaryResource(true);
      setIsSecondaryResourceDropdownOpen(true);
      searchUsersAPI(query).subscribe({
        next: (results) => {
          // Filter out primary resource and already selected secondary resources
          const filtered = results.filter(user => 
            user.id !== selectedPrimaryResource?.id &&
            !selectedSecondaryResources.some(r => r.id === user.id)
          );
          setSecondaryResourceResults(filtered);
          setIsSearchingSecondaryResource(false);
        },
        error: (error) => {
          console.error("Failed to search users:", error);
          setSecondaryResourceResults([]);
          setIsSearchingSecondaryResource(false);
        },
      });
    } else {
      setSecondaryResourceResults([]);
      setIsSecondaryResourceDropdownOpen(false);
    }
  };

  const handleSelectSecondaryResource = (user: UserSearchResult) => {
    setSelectedSecondaryResources(prev => [...prev, user]);
    setSecondaryResourceSearch('');
    setSecondaryResourceResults([]);
    setIsSecondaryResourceDropdownOpen(false);
  };

  const handleRemoveSecondaryResource = (userId: string) => {
    setSelectedSecondaryResources(prev => prev.filter(r => r.id !== userId));
  };

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

  const getFilteredActivityItems = (): ActivityItem[] => {
    let items = activityItems;
    if (!showSystemNotes) {
      items = items.filter(item => {
        if (item.type === 'note') {
          return item.noteTypeId !== 13;
        }
        return true;
      });
    }
    
    // Sort: pinned notes first, then by date
    return [...items].sort((a, b) => {
      // Check if items are notes with is_pinned
      const aIsPinned = a.type === 'note' && a.isPinned === true;
      const bIsPinned = b.type === 'note' && b.isPinned === true;
      
      // Pinned notes come first
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      
      // If both have same pin status, maintain original order (by date)
      return 0;
    });
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
    
    if (ticketData.primaryResource && typeof ticketData.primaryResource === 'object') {
      setSelectedPrimaryResource({
        id: ticketData.primaryResource.autotaskId?.toString() || '',
        name: ticketData.primaryResource.name || '',
      });
    } else {
      setSelectedPrimaryResource(null);
    }
    
    if (ticketData.secondaryResource && Array.isArray(ticketData.secondaryResource) && ticketData.secondaryResource.length > 0) {
      const mappedSecondaryResources = ticketData.secondaryResource.map((resource: any) => ({
        id: (resource.autotaskId || resource.autotask_id)?.toString() || '',
        name: resource.name || '',
      }));
      setSelectedSecondaryResources(mappedSecondaryResources);
    } else {
      setSelectedSecondaryResources([]);
    }
    
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setChecklistItems([]);
    setSelectedPrimaryResource(null);
    setSelectedSecondaryResources([]);
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
      primary_resource: selectedPrimaryResource ? { resource_id: parseInt(selectedPrimaryResource.id) } : undefined,
      secondary_resources: selectedSecondaryResources.length > 0 
        ? selectedSecondaryResources.map(r => ({ resource_id: parseInt(r.id) }))
        : undefined,
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
      <div className="min-h-screen bg-background smooth-transition">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
        <main className="flex-1 bg-background smooth-transition">
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
      <div className="min-h-screen bg-background smooth-transition">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
        <main className="flex-1 bg-background smooth-transition">
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
    <div className="min-h-screen bg-background smooth-transition">
      {/* Back Button Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-medium text-foreground">{ticketData.ticketNumber}</span>
        <span className="text-sm text-muted-foreground">-</span>
        <span className="text-sm text-muted-foreground truncate max-w-md">{ticketData.title}</span>
      </div>
      <main className="flex-1 bg-background smooth-transition">
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
              <div className="px-4 pb-4 pt-4 space-y-3">
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
                    <div className="relative">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Primary Resource (Role)</p>
                      {isEditMode ? (
                        <div className="space-y-2">
                          {selectedPrimaryResource ? (
                            <div className="flex items-center gap-1">
                              <div className="flex-1 flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded text-sm">
                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
                                  {selectedPrimaryResource.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="flex-1 truncate text-foreground">{selectedPrimaryResource.name}</span>
                                <X 
                                  className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" 
                                  onClick={handleRemovePrimaryResource}
                                />
                              </div>
                              <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                              <button className="p-1.5 border border-border rounded hover:bg-accent"><Filter className="h-3 w-3" /></button>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Type to search..."
                                  value={primaryResourceSearch}
                                  onChange={(e) => handlePrimaryResourceSearch(e.target.value)}
                                  onFocus={() => primaryResourceSearch.length >= 2 && setIsPrimaryResourceDropdownOpen(true)}
                                  className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                                />
                                <button className="p-1.5 border border-border rounded hover:bg-accent"><Search className="h-3 w-3" /></button>
                                <button className="p-1.5 border border-border rounded hover:bg-accent"><Filter className="h-3 w-3" /></button>
                              </div>
                              {isPrimaryResourceDropdownOpen && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {isSearchingPrimaryResource ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                                  ) : primaryResourceResults.length > 0 ? (
                                    <>
                                      <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-accent/30">
                                        SELECTED QUEUE
                                      </div>
                                      {primaryResourceResults.map((user) => (
                                        <button
                                          key={user.id}
                                          onClick={() => handleSelectPrimaryResource(user)}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                                        >
                                          <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[8px] font-bold">
                                            {user.name.substring(0, 2).toUpperCase()}
                                          </div>
                                          <span className="text-foreground">{user.name}</span>
                                        </button>
                                      ))}
                                    </>
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
                    <div className="relative">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Secondary Resources (Role)</p>
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Type to search..."
                                value={secondaryResourceSearch}
                                onChange={(e) => handleSecondaryResourceSearch(e.target.value)}
                                onFocus={() => secondaryResourceSearch.length >= 2 && setIsSecondaryResourceDropdownOpen(true)}
                                className="flex-1 px-2 py-1.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#1fb6a6]"
                              />
                              <button className="p-1.5 border border-border rounded hover:bg-accent"><Filter className="h-3 w-3" /></button>
                            </div>
                            {isSecondaryResourceDropdownOpen && (
                              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {isSearchingSecondaryResource ? (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                                ) : secondaryResourceResults.length > 0 ? (
                                  <>
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-accent/30">
                                      SELECTED QUEUE
                                    </div>
                                    {secondaryResourceResults.map((user) => (
                                      <button
                                        key={user.id}
                                        onClick={() => handleSelectSecondaryResource(user)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                                      >
                                        <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[8px] font-bold">
                                          {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-foreground">{user.name}</span>
                                      </button>
                                    ))}
                                  </>
                                ) : (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">No users found</div>
                                )}
                              </div>
                            )}
                          </div>
                          {selectedSecondaryResources.length > 0 && (
                            <div className="space-y-1">
                              {selectedSecondaryResources.map((resource) => (
                                <div key={resource.id} className="flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded text-sm">
                                  <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[8px] font-bold">
                                    {resource.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="flex-1 truncate text-foreground">{resource.name}</span>
                                  <X 
                                    className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" 
                                    onClick={() => handleRemoveSecondaryResource(resource.id)}
                                  />
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
                      <button 
                        onClick={() => setIsNewTimeEntryModalOpen(true)}
                        disabled={statusName === 'Complete'}
                        className={`flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium transition-colors ${
                          statusName === 'Complete' 
                            ? 'text-muted-foreground cursor-not-allowed opacity-50' 
                            : 'text-foreground hover:bg-accent/30'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        New Time Entry
                      </button>
                      <button 
                        onClick={() => setIsNewNoteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent/30 transition-colors"
                      >
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
                          <span className="ml-2 text-sm text-muted-foreground">Loading activity...</span>
                        </div>
                      ) : getFilteredActivityItems().length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">No activity to display</p>
                        </div>
                      ) : (
                        getFilteredActivityItems().map((item) => (
                          <div key={`${item.type}-${item.id}`} className="relative flex gap-3 p-3 bg-background rounded-lg border border-border">
                            {item.type === 'note' && (
                              <button
                                onClick={() => handlePinClick(item.id)}
                                className={`absolute top-2 right-2 p-1 rounded transition-colors ${
                                  item.isPinned 
                                    ? 'hover:bg-green-100 dark:hover:bg-green-900/30' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
                                }`}
                                title={item.isPinned ? "Unpin note" : "Pin note"}
                              >
                                <svg 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`transition-colors ${
                                    item.isPinned 
                                      ? 'text-green-500 hover:text-green-600' 
                                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                                  }`}
                                >
                                  <path 
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            )}
                            {item.type === 'note' ? (
                              <>
                                <div className={`w-8 h-8 rounded-full ${item.noteTypeId === 13 ? 'bg-gray-500' : 'bg-purple-500'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                  {getCreatorInitials(item.creator)}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.creator ? (
                                      <>
                                        <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">
                                          {typeof item.creator === 'object' ? item.creator.name : item.creator}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                                      </>
                                    ) : (
                                      <span className="text-sm font-semibold text-muted-foreground">System</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground font-medium mb-1">{item.title}</p>
                                  {item.publishId === 2 && (
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-600 border border-green-500 rounded mb-1">
                                      Internal Only
                                    </span>
                                  )}
                                  {item.description !== item.title && (
                                    <p className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap">{item.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mb-2">{formatNoteDate(item.createDateTime)}</p>
                                  
                                  {/* Attachments */}
                                  {item.attachments && item.attachments.length > 0 && (
                                    <div className="mb-2">
                                      {item.attachments.map((attachment) => {
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
                                    {item.attachments && item.attachments.length > 0 && (
                                      <span className="text-xs text-[#1fb6a6] hover:underline cursor-pointer">attachment</span>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 rounded-full bg-[#1fb6a6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {item.creator ? getCreatorInitials(item.creator.name) : 'TE'}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.creator ? (
                                      <>
                                        <span className="text-sm font-semibold text-[#1fb6a6] hover:underline cursor-pointer">
                                          {item.creator.name}
                                        </span>
                                        <ExternalLink className="h-3 w-3 text-[#1fb6a6]" />
                                      </>
                                    ) : (
                                      <span className="text-sm font-semibold text-muted-foreground">Unknown</span>
                                    )}
                                    <span className="px-2 py-0.5 bg-[#1fb6a6]/10 text-[#1fb6a6] text-xs rounded font-medium">Time Entry</span>
                                  </div>
                                  <p className="text-sm text-foreground font-medium mb-1">
                                    {item.hoursWorked.toFixed(2)} hours worked
                                  </p>
                                  {item.summaryNotes && (
                                    <p className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap">{item.summaryNotes}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                    <span>{formatNoteDate(item.createDateTime)}</span>
                                    <span className="text-border">|</span>
                                    <span>
                                      {new Date(item.startDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#1fb6a6] hover:underline cursor-pointer">time</span>
                                  </div>
                                </div>
                              </>
                            )}
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
                  className="flex items-center justify-between w-full px-5 pt-3.5 pb-3.5 text-left hover:bg-accent/40 transition-colors"
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

      {/* New Note Modal */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-[700px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="text-lg font-semibold text-foreground">New Note</h3>
              <button
                onClick={() => {
                  setIsNewNoteModalOpen(false);
                  setNewNote({ title: '', noteTypeId: 1, publishTypeId: 1 });
                  if (noteDescriptionRef.current) noteDescriptionRef.current.value = '';
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
                <button 
                  onClick={() => handleSaveNote(true)}
                  disabled={isSavingNote}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#1fb6a6] text-white rounded hover:bg-[#1aa396] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingNote ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      <path d="M12 6V4M12 20V18M6 12H4M20 12H18M7.75736 7.75736L6.34315 6.34315M17.6569 17.6569L16.2426 16.2426M7.75736 16.2426L6.34315 17.6569M17.6569 6.34315L16.2426 7.75736" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSavingNote ? 'Saving...' : 'Save & Close'}
                </button>
                <button 
                  onClick={() => handleSaveNote(false)}
                  disabled={isSavingNote}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingNote ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      <path d="M12 6V4M12 20V18M6 12H4M20 12H18M7.75736 7.75736L6.34315 6.34315M17.6569 17.6569L16.2426 16.2426M7.75736 16.2426L6.34315 17.6569M17.6569 6.34315L16.2426 7.75736" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSavingNote ? 'Saving...' : 'Save & New'}
                </button>
                <button
                  onClick={() => {
                    setIsNewNoteModalOpen(false);
                    setNewNote({ title: '', noteTypeId: 1, publishTypeId: 1 });
                    if (noteDescriptionRef.current) noteDescriptionRef.current.value = '';
                  }}
                  disabled={isSavingNote}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>

              {/* General Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-base font-semibold text-foreground">General</h4>
                </div>

                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title <span className="text-[#ee754e]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6]"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description <span className="text-[#ee754e]">*</span>
                  </label>
                  
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 px-2 py-1.5 border border-border border-b-0 rounded-t-md bg-accent/20">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Bold">
                      <Bold className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Italic">
                      <Italic className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Underline">
                      <Underline className="h-4 w-4 text-foreground" />
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Ordered List">
                      <ListOrdered className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Unordered List">
                      <List className="h-4 w-4 text-foreground" />
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Insert Image">
                      <Image className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                  
                  <textarea
                    ref={noteDescriptionRef}
                    placeholder="Enter note description..."
                    rows={8}
                    maxLength={32000}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-b-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] resize-y"
                  />
                  <p className="text-xs text-muted-foreground mt-1">32000 characters remaining</p>
                </div>

                {/* Note Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Note Type</label>
                  <div className="relative">
                    <select
                      value={newNote.noteTypeId}
                      onChange={(e) => setNewNote({ ...newNote, noteTypeId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] appearance-none cursor-pointer"
                    >
                      {(metadata?.noteType || [
                        { id: 1, name: "Task Summary" },
                        { id: 2, name: "Task Detail" },
                        { id: 3, name: "Task Notes" },
                        { id: 13, name: "Workflow Rule Note - Task" },
                        { id: 15, name: "Duplicate Ticket Note" },
                        { id: 16, name: "Outsource Workflow Note" },
                        { id: 17, name: "Surveys" },
                        { id: 18, name: "Client Portal Note" },
                        { id: 19, name: "Taskfire Note" },
                        { id: 91, name: "Workflow Rule Action Note" },
                        { id: 92, name: "Forward/Modify Note" },
                        { id: 93, name: "Merged Into Ticket" },
                        { id: 94, name: "Absorbed Another Ticket" },
                        { id: 95, name: "Copied to Project" },
                        { id: 99, name: "RMM Note" },
                        { id: 100, name: "BDR Note" },
                        { id: 201, name: "Test Note Provider" },
                        { id: 202, name: "Test Note Provider 2" }
                      ]).map((noteType) => (
                        <option key={noteType.id} value={noteType.id}>{noteType.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Publish Type Checkbox */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={newNote.publishTypeId === 2}
                        onChange={(e) => setNewNote({ ...newNote, publishTypeId: e.target.checked ? 2 : 1 })}
                        className="w-4 h-4 rounded border-border text-[#1fb6a6] focus:ring-[#1fb6a6] focus:ring-offset-0"
                      />
                    </div>
                    <span className="text-sm text-foreground group-hover:text-[#1fb6a6] transition-colors">
                      {(metadata?.notePublishType || [
                        { id: 1, name: "All Autotask Users" },
                        { id: 2, name: "Internal Project Team" },
                        { id: 4, name: "Internal & Co-Managed" }
                      ]).find(pt => pt.id === 2)?.name || "Internal Project Team"}
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 ml-7">
                    {newNote.publishTypeId === 1 ? 'Currently: All Autotask Users' : 'Currently: Internal Project Team'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Time Entry Modal */}
      {isNewTimeEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="text-lg font-semibold text-foreground">New Time Entry</h3>
              <button
                onClick={() => {
                  setIsNewTimeEntryModalOpen(false);
                  setNewTimeEntry({
                    date: new Date().toISOString().split('T')[0],
                    startTime: '',
                    endTime: '',
                    timeWorkedHours: 0,
                    timeWorkedMinutes: 0,
                  });
                  if (summaryNotesRef.current) summaryNotesRef.current.value = '';
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
                <button 
                  onClick={() => handleSaveTimeEntry(false)}
                  disabled={isSavingTimeEntry}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#1fb6a6] text-white rounded hover:bg-[#1aa396] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingTimeEntry ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save & Close
                </button>
                <button 
                  onClick={() => handleSaveTimeEntry(true)}
                  disabled={isSavingTimeEntry}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingTimeEntry ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save & New
                </button>
                <button
                  onClick={() => {
                    setIsNewTimeEntryModalOpen(false);
                    setNewTimeEntry({
                      date: new Date().toISOString().split('T')[0],
                      startTime: '',
                      endTime: '',
                      timeWorkedHours: 0,
                      timeWorkedMinutes: 0,
                    });
                    if (summaryNotesRef.current) summaryNotesRef.current.value = '';
                  }}
                  disabled={isSavingTimeEntry}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Row 1: Date, Start Time, End Time, Time Worked */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date <span className="text-[#ee754e]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newTimeEntry.date}
                        onChange={(e) => setNewTimeEntry({ ...newTimeEntry, date: e.target.value })}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Time <span className="text-[#ee754e]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newTimeEntry.startTime}
                        onChange={(e) => {
                          setNewTimeEntry({ ...newTimeEntry, startTime: e.target.value });
                          if (newTimeEntry.endTime) {
                            calculateTimeWorked(e.target.value, newTimeEntry.endTime);
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Time <span className="text-[#ee754e]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newTimeEntry.endTime}
                        onChange={(e) => {
                          setNewTimeEntry({ ...newTimeEntry, endTime: e.target.value });
                          if (newTimeEntry.startTime) {
                            calculateTimeWorked(newTimeEntry.startTime, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Time Worked */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time Worked <span className="text-[#ee754e]">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={newTimeEntry.timeWorkedHours}
                        onChange={(e) => setNewTimeEntry({ ...newTimeEntry, timeWorkedHours: parseInt(e.target.value) || 0 })}
                        className="w-14 px-2 py-2.5 bg-background border border-border rounded-md text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6]"
                      />
                      <span className="text-sm text-muted-foreground">h</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={newTimeEntry.timeWorkedMinutes}
                        onChange={(e) => setNewTimeEntry({ ...newTimeEntry, timeWorkedMinutes: Math.min(59, parseInt(e.target.value) || 0) })}
                        className="w-14 px-2 py-2.5 bg-background border border-border rounded-md text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6]"
                      />
                      <span className="text-sm text-muted-foreground">m</span>
                    </div>
                  </div>
                </div>

                {/* Summary Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Summary Notes <span className="text-[#ee754e]">*</span>
                  </label>
                  
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 px-2 py-1.5 border border-border border-b-0 rounded-t-md bg-accent/20">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Bold">
                      <Bold className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Italic">
                      <Italic className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Underline">
                      <Underline className="h-4 w-4 text-foreground" />
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Ordered List">
                      <ListOrdered className="h-4 w-4 text-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Unordered List">
                      <List className="h-4 w-4 text-foreground" />
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="p-1.5 hover:bg-accent rounded transition-colors" title="Insert Image">
                      <Image className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                  
                  <textarea
                    ref={summaryNotesRef}
                    placeholder="Enter summary notes..."
                    rows={5}
                    maxLength={32000}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-b-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1fb6a6]/30 focus:border-[#1fb6a6] resize-y"
                  />
                  <p className="text-xs text-muted-foreground mt-1">32000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pin Confirmation Modal */}
      {isPinConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-xl w-[400px] max-w-[90vw] p-6">
            {/* Pin Icon SVG Illustration */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-purple-500"
                >
                  <path 
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <path 
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">
              Toggle Pin Status
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center mb-6">
              Are you sure you want to change the pin status of this note?
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsPinConfirmOpen(false);
                  setPinningNoteId(null);
                }}
                disabled={isTogglingPin}
                className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                No
              </button>
              <button
                onClick={handleConfirmPin}
                disabled={isTogglingPin}
                className="px-6 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isTogglingPin ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Yes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
