import { NOTIFICATION_TYPES } from "@/constants/notification-type";
import { toast } from "sonner";

interface NotificationProps {
  type?: string;
  message: string;
}

export const showNotification = ({
  type = NOTIFICATION_TYPES.ERROR,
  message,
}: NotificationProps) => {
  switch (type) {
    case NOTIFICATION_TYPES.ERROR:
      toast.error(message);
      break;
    case NOTIFICATION_TYPES.INFO:
      toast(message);
      break;
    case NOTIFICATION_TYPES.SUCCESS:
      toast.success(message);
      break;
    case NOTIFICATION_TYPES.WARNING:
      toast.warning(message);
      break;
    default:
      toast(message);
  }
};
