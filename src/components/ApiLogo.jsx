import { logoHue, providerInitials } from "../lib/categoryStyle.js";

export default function ApiLogo({ api, size = 40, rounded = "circle" }) {
  const initials = providerInitials(api.provider, api.source);
  const hue = logoHue(api.id || api.title);
  const style = {
    width: size,
    height: size,
    background: `hsl(${hue} 68% 92%)`,
    color: `hsl(${hue} 55% 32%)`,
    borderRadius: rounded === "square" ? "8px" : "999px",
  };

  return (
    <div className="hub-logo" style={style} aria-hidden="true">
      {initials}
    </div>
  );
}
