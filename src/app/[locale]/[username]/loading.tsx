// ============================================================
// ⬢ [USERNAME] LOADING
// ============================================================

import { PageSpinner } from '@/components/ui/Spinner';

export default function DashboardLoading() {
  return (
    <PageSpinner
      message="Loading analysis…"
      subMessage="Fetching game history from Chess.com"
    />
  );
}