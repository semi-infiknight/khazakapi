import { Link } from "react-router-dom";

export default function SubpageKeysLink() {
  return (
    <Link to="/keys" className="subpage-keys-link" aria-label="API key manager">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 6.5V4.5a2.5 2.5 0 0 0-5 0v2M3 6.5h9v7H3v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Keys
    </Link>
  );
}
