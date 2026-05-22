// Singleton callback registered by ToastContainer
let _addToast;

export function toast(msg, type = "info") {
  _addToast?.({ id: Date.now() + Math.random(), msg, type });
}

export function registerToastHandler(fn) {
  _addToast = fn;
}
