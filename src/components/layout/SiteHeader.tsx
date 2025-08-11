import { Link, NavLink } from "react-router-dom";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_24px_hsl(var(--primary)/.5)]" aria-hidden />
          <span className="font-semibold tracking-tight">Jura Navigator</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `text-sm transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`
            }
          >
            Bibliothek
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
