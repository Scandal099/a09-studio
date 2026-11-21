import Link from "next/link";
import { redirect } from "next/navigation";
import { withBasePath } from "@/lib/paths";

export default function EnglishRedirectPage() {
  if (process.env.STATIC_EXPORT !== "true") {
    redirect("/");
  }

  const target = withBasePath("/");

  return (
    <main className="container not-found-main">
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <h1 className="not-found-title">Переход на главную А/09…</h1>
      <p className="not-found-lead">
        Англоязычная версия временно отключена. Если переход не произошёл
        автоматически, нажмите кнопку ниже.
      </p>
      <div className="not-found-actions">
        <Link href="/" className="pill-btn pill-light pill-lg">
          Перейти на главную
        </Link>
      </div>
    </main>
  );
}
