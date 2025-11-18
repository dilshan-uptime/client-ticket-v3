import { UITestComponent } from "@/shared/global-modal/UITestComponent";

const modalConfig = {
  testModal: {
    id: "test-modal",
    component: UITestComponent,
  },
} as const;

export const MODAL_IDS = Object.fromEntries(
  Object.entries(modalConfig).map(([key, value]) => [key, value.id])
) as Record<keyof typeof modalConfig, string>;

export const modalComponentMapping = Object.fromEntries(
  Object.entries(modalConfig).map(([_, value]) => [value.id, value.component])
) as Record<string, React.ComponentType<any>>;
