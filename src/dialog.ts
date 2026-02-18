import { inject, type InjectionKey } from "vue";

export interface DialogApi {
  confirm(title?: string, body?: string): Promise<boolean>;
}

export const DialogKey: InjectionKey<DialogApi> = Symbol("Dialog");

export function useDialog() {
  const dialog = inject(DialogKey);

  if (!dialog) {
    throw new Error("DialogProvider not found");
  }

  return dialog;
}
