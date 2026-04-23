/** Fired when user-scoped metrics on the home dashboard may have changed (bookings, tickets). */
export const DASHBOARD_USER_METRICS_EVENT = 'smartcampus:user-dashboard-metrics';

export function notifyUserDashboardMetricsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_USER_METRICS_EVENT));
}
