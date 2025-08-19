import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GA_ID, gtag, sendPageview } from "@/lib/ga";

const initScript = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  // Initiales config – schickt page_view für die erste Seite
  gtag('config', '${import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX"}', {
    send_page_view: true
  });
`;

export default function GA() {
  const location = useLocation();

  useEffect(() => {
    // Bei jedem Routenwechsel ein page_view senden (SPA)
    sendPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  if (!GA_ID || GA_ID === "G-NSQ5VN8HDW") {
    // GA nicht initialisieren, wenn keine echte ID gesetzt ist
    return null;
  }

  return (
    <>
      <Helmet>
        {/* GA4 gtag Loader */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        {/* Init Script */}
        <script>{initScript}</script>
      </Helmet>
    </>
  );
}
