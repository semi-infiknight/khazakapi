import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

/** Floating logo — no nav links, no header bar, no layout constraint. */
export default function Header() {
  return (
    <div className="site-chrome" aria-label="Site">
      <Link to="/" className="brand-lockup site-chrome-brand">
        <Logo />
      </Link>
    </div>
  );
}
