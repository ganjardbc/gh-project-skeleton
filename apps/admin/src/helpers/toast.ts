import { useGlobalToast, useGlobalConfirm } from '@gh-skeleton/ui/prime';
import type { ShowToastParams, ShowConfirmParams } from '@gh-skeleton/ui/prime';

const { showToast: globalShowToast } = useGlobalToast();
const { showConfirm: globalShowConfirm } = useGlobalConfirm();

export const showToast = (params: ShowToastParams) => {
  globalShowToast(params);
};

export const showConfirm = (params: ShowConfirmParams) => {
  globalShowConfirm(params);
};
