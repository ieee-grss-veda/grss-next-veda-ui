declare global {
  interface Window {
    showCollectorDialog?: () => void;
  }
}

export function openContactWidget() {
  if (typeof window !== 'undefined' && window.showCollectorDialog) {
    window.showCollectorDialog();
  }
}
