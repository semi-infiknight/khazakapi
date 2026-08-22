import { Link } from "react-router-dom";
import EgovKeySetup from "../components/EgovKeySetup.jsx";

export default function EgovKeyPage() {
  return (
    <div className="container-main max-w-3xl py-8 pb-16">
      <Link to="/" className="font-mono text-xs text-[var(--text-soft)] hover:text-[var(--text)]">
        ← back to directory
      </Link>

      <h1 className="mt-4 text-3xl font-bold leading-tight">data.egov.kz API key setup</h1>
      <p className="mt-2 text-sm text-[var(--text-soft)]">
        ~140 official open datasets on the Kazakhstan Open Data portal require a free API key. Set it up once,
        then test any of them from Khazak without re-entering the key.
      </p>

      <EgovKeySetup />

      <div className="panel mt-4 p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Privacy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-soft)]">
          <li>Your key is stored in this browser&apos;s localStorage only.</li>
          <li>Khazak validates the key with a single live request when you click save.</li>
          <li>When you use &ldquo;Try it out&rdquo;, the key is sent to our proxy so we can call data.egov.kz on your behalf.</li>
          <li>We do not keep a shared server-side key for all users.</li>
        </ul>
      </div>
    </div>
  );
}
