import Script from 'next/script';

const StructuredData = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Untitled Trading",
    "alternateName": "Untitled Trading Co",
    "url": "https://untitledtrading.com",
    "logo": "https://untitledtrading.com/design/Untitled.png",
    "description": "The first AI-native quantitative trading firm leveraging autonomous agents for high-frequency trading.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Giordan Masen",
        "jobTitle": "Co-Founder, Business Lead & Quantitative Developer",
        "sameAs": [
          "https://www.linkedin.com/in/gmasen/",
          "https://www.instagram.com/ggiordann/"
        ]
      },
      {
        "@type": "Person",
        "name": "Ghazi Kazmi",
        "jobTitle": "Co-Founder & Quantitative Developer",
        "sameAs": [
          "https://www.linkedin.com/in/ghazi-kazmi-3820ab263/",
          "https://www.instagram.com/gxxviik/"
        ]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Adelaide",
      "addressRegion": "SA",
      "addressCountry": "AU"
    },
    "sameAs": [
      "https://x.com/UntitledTrading",
      "https://www.instagram.com/untitledtrading/",
      "https://www.linkedin.com/company/untitled-trading/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Business Inquiries",
      "email": "contact@untitledtrading.com"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Untitled Trading",
    "url": "https://untitledtrading.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://untitledtrading.com/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  );
};

export default StructuredData;