import { logoHue, providerInitials } from "../lib/categoryStyle.js";

export default function ApiLogo({ api, size = 44 }) {
  const initials = providerInitials(api.provider, api.source);
  const hue = logoHue(api.id || api.title);

  return (
    <div
      className="api-card-logo"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 42% 22%)`,
        color: `hsl(${hue} 55% 88%)`,
        borderColor: `hsl(${hue} 35% 32%)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
