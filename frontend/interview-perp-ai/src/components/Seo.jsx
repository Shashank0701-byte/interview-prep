import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://interview-prep-karo.netlify.app").replace(/\/$/, "");
const DEFAULT_DESCRIPTION =
  "Practice technical interviews with AI-generated questions, feedback, mock interviews, roadmaps, and progress analytics.";

const PUBLIC_PAGES = {
  "/": {
    title: "Interview Prep AI | Practice Smarter, Interview Better",
    description: DEFAULT_DESCRIPTION,
  },
  "/login": {
    title: "Log in | Interview Prep AI",
    description: "Log in to continue your personalized interview preparation.",
  },
  "/signUp": {
    title: "Create an account | Interview Prep AI",
    description: "Create an Interview Prep AI account and begin practicing today.",
  },
};

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PUBLIC_PAGES[pathname] || {
      title: "Interview Prep AI",
      description: DEFAULT_DESCRIPTION,
    };
    const canonicalUrl = new URL(pathname, `${SITE_URL}/`).toString();
    const ogImage = new URL("/Screenshot%202026-07-22%20160719.png", `${SITE_URL}/`).toString();
    const isPublicPage = Object.hasOwn(PUBLIC_PAGES, pathname);

    document.title = page.title;
    setMeta('meta[name="description"]', "name", "description");
    document.head.querySelector('meta[name="description"]').setAttribute("content", page.description);
    setMeta('meta[property="og:title"]', "property", "og:title");
    document.head.querySelector('meta[property="og:title"]').setAttribute("content", page.title);
    setMeta('meta[property="og:description"]', "property", "og:description");
    document.head.querySelector('meta[property="og:description"]').setAttribute("content", page.description);
    setMeta('meta[property="og:image"]', "property", "og:image");
    document.head.querySelector('meta[property="og:image"]').setAttribute("content", ogImage);
    setMeta('meta[property="og:url"]', "property", "og:url");
    document.head.querySelector('meta[property="og:url"]').setAttribute("content", canonicalUrl);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card");
    document.head.querySelector('meta[name="twitter:card"]').setAttribute("content", "summary_large_image");
    setMeta('meta[name="robots"]', "name", "robots");
    document.head.querySelector('meta[name="robots"]').setAttribute("content", isPublicPage ? "index,follow" : "noindex,nofollow");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    let structuredData = document.getElementById("site-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "site-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Interview Prep AI",
      description: page.description,
      url: canonicalUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
    });
  }, [pathname]);

  return null;
}
