export const SiteFooter = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Jura Navigator. Private Lernplattform – nicht mit JuraOnline affiliiert.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
