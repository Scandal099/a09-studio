export async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below
  }
  if (typeof document === "undefined") return false;
  const helper = document.createElement("textarea");
  try {
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    helper.remove();
  }
}
