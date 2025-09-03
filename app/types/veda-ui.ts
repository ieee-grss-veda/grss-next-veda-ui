/**
 * Temporary local re-declarations of types that exist inside @teamimpact/veda-ui
 * but are not yet exported in its public API.
 *
 * These allow us to stay type-safe (instead of using @ts-nocheck) when working with
 * MapBlock and related components in this repo.
 *
 * Once veda-ui exports these types officially, this file should be removed
 * and imports switched back to @teamimpact/veda-ui (via app/lib/index.ts).
 *
 * Tracking issue on the veda-ui side: https://github.com/NASA-IMPACT/veda-ui/issues/1845
 */
export enum DatasetStatus {
  SUCCESS = 'success',
  LOADING = 'loading',
  ERROR = 'error',
}

export interface VizDatasetSuccess {
  status: DatasetStatus.SUCCESS;
  error: null;
  id: string;
  name: string;
  type: string;
  data: any;
  settings: {
    isVisible: boolean;
    opacity: number;
  };
}
