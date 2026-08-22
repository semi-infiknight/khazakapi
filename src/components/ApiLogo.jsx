import { logoHue, providerInitials } from "../lib/categoryStyle.js";

export default function ApiLogo({ api, size = 40 }) {
  const initials = providerInitials(api.provider, api.source);
  const hue = logoHue(api.id || api.title);
  const style = {
    width: size,
    height: size,
    background: `hsl(${hue} 68% 92%)`,
    color: `hsl(${hue} 55% 32%)`,
  };

  return (
    <div className="hub-logo" style={style} aria-hidden="true">
      {initials}
    </div>
  );
}
