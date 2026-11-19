import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { services } from "@/studio/content";

const failed = (message: string, status: number) => Response.json({ error: message }, { status });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(request.url).origin !== origin) return failed("Please submit from the studio website.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return failed("Expected a JSON brief.", 415);
  const reader = request.body?.getReader();
  if (!reader) return failed("A brief is required.", 400);
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.length;
    if (bytes > 24000) {
      await reader.cancel();
      return failed("Please shorten your brief.", 413);
    }
    body += decoder.decode(chunk.value, { stream: true });
  }
  let data;
  try { data = JSON.parse(body + decoder.decode()); } catch { return failed("Invalid brief.", 400); }
  if (!data || typeof data !== "object") return failed("Invalid brief.", 400);
  const field = (key: string) => typeof data[key] === "string" ? data[key].trim() : "";
  const id = field("id"), name = field("name"), email = field("email"), service = field("service"), brief = field("brief");
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) ||
      !name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      ![...services.map(item => item.title), "Still exploring"].includes(service) || brief.length < 10 || brief.length > 3000)
    return failed("Check your name, email, service and project description.", 400);
  try {
    await getDb().insert(inquiries).values({ id, createdAt: Date.now(), name, email, service, brief }).onConflictDoNothing();
    return Response.json({ reference: id.slice(0, 8).toUpperCase() }, { status: 201 });
  } catch {
    return failed("The studio inbox is temporarily unavailable. Your text is still here. Please try again.", 503);
  }
}
