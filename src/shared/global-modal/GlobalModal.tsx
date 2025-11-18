import { useAppDispatch, useAppSelector } from "@/hooks/store-hooks";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { appActions, getModalData } from "@/app/redux/appSlice";
import { modalComponentMapping } from "@/services/other/modal-component-mapping";

export const GlobalModal = () => {
  const dispatch = useAppDispatch();
  const modalData = useAppSelector(getModalData);

  const closeModal = () => {
    dispatch(appActions.closeModal());
  };

  const ComponentToRender = modalData?.bodyId
    ? modalComponentMapping[modalData.bodyId]
    : null;

  return (
    <Dialog
      open={modalData.open}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto w-full lg:max-w-[${
          modalData?.width ? modalData?.width : "600px"
        }]`}
      >
        <DialogHeader>
          {modalData.title && <DialogTitle>{modalData.title}</DialogTitle>}
          <DialogDescription className="sr-only">
            {modalData.title}
          </DialogDescription>
        </DialogHeader>

        {ComponentToRender && <ComponentToRender {...modalData?.params} />}
      </DialogContent>
    </Dialog>
  );
};
