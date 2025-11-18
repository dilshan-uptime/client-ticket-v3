import { showNotification } from "./global-toaster";

export const errorHandler = (e: any) => {
  console.log(e);
  if (e?.code && e?.error && e?.message) {
    if (e?.data && e?.data?.length > 0) {
      e?.data.map((item: string) => {
        return showNotification({ message: item });
      });
    } else {
      showNotification({ message: e?.message });
    }
  } else if (!e?.success && e?.message) {
    showNotification({ message: e?.message });
  } else {
    showNotification({ message: "Something went wrong." });
  }
};
