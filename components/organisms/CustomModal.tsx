import * as Dialog from "@radix-ui/react-dialog";
import { ClipboardPenLine, X } from "lucide-react";
import React, { useRef, ReactElement, cloneElement } from "react";
import CustomButton from "../atoms/CustomButton";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactElement;
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  children,
}: CustomModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 backdrop-blur-sm"
          style={{ background: "rgba(4,6,18,0.7)" }}
        />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-2xl p-px shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(19,39,90,0.2) 50%, rgba(74,127,255,0.2) 100%)",
            }}
          >
            <div
              className="rounded-[15px] p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(24px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <ClipboardPenLine size={18} style={{ color: "#4a7fff" }} />
                  <Dialog.Title
                    className="font-bold text-white text-lg"
                    style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
                  >
                    {title}
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {React.isValidElement(children) &&
                cloneElement(children, {
                  ref: formRef,
                  onSuccess: onClose,
                } as any)}

              <div className="flex justify-end gap-3 mt-6 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <CustomButton
                  text="Cerrar"
                  variant="ghost"
                  typeButton="button"
                  onClickButton={onClose}
                />
                <CustomButton
                  text="Guardar"
                  variant="primary"
                  typeButton="submit"
                  onClickButton={() => formRef.current?.requestSubmit()}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
