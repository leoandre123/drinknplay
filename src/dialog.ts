import { inject, type Component, type InjectionKey } from "vue";

export interface DialogApi {
  confirm(title?: string, body?: string): Promise<boolean>;
  info(title?: string, body?: string, buttonText?: string): Promise<void>;

  open<T>(
    component: Component,
    props?: Record<string, any>,
    emits?: Record<string, any>,
  ): Promise<T>;
  modal<T>(
    component: Component,
    frame?: { title: string; showClose: boolean },
    props?: Record<string, any>,
    emits?: Record<string, any>,
  ): Promise<T>;
}

export const DialogKey: InjectionKey<DialogApi> = Symbol("Dialog");

export function useDialog() {
  const dialog = inject(DialogKey);

  if (!dialog) {
    throw new Error("DialogProvider not found");
  }

  return dialog;
}
