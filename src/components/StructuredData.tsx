import Script from 'next/script';

const StructuredData = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Untitled Trading",
    "alternateName": "Untitled Trading Co",
    "url": "https://untitledtrading.com",
    "logo": "https://untitledtrading.com/design/Untitled.png",
    "description": "AI-native infrastructure for prediction markets.",
    "foundingDate": "2025",
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
    "member": [
      {
        "@type": "Person",
        "name": "Aditya Payanadan",
        "jobTitle": "Developer & Quantitative Researcher",
        "sameAs": [
          "https://www.linkedin.com/in/apayanadan/",
          "https://www.instagram.com/ad1tya_payanadan/"
        ]
      },
      {
        "@type": "Person",
        "name": "Jin Xing",
        "jobTitle": "Trader & Quantitative Researcher",
        "sameAs": [
          "https://www.linkedin.com/in/jin-xing-8bb72a406/",
          "https://www.instagram.com/sterhamms/"
        ]
      },
      {
        "@type": "Person",
        "name": "Kalan Masen",
        "jobTitle": "Quantitative Researcher",
        "sameAs": [
          "https://www.linkedin.com/in/kalan-masen-077698373/",
          "https://www.instagram.com/kalanmasen09/"
        ]
      },
      {
        "@type": "Person",
        "name": "Asad Khan",
        "jobTitle": "Design Lead",
        "sameAs": [
          "https://www.linkedin.com/in/asad-khan-37aa562a1/",
          "https://www.instagram.com/asad.webp/"
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

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://untitledtrading.com",
    "name": "Untitled Trading",
    "url": "https://untitledtrading.com",
    "email": "contact@untitledtrading.com",
    "description": "AI-native infrastructure for prediction markets based in Adelaide, Australia.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Adelaide",
      "addressRegion": "SA",
      "postalCode": "5000",
      "addressCountry": "AU"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Adelaide"
      },
      {
        "@type": "State",
        "name": "South Australia"
      },
      {
        "@type": "Country",
        "name": "Australia"
      }
    ],
    "serviceType": "Financial Technology Services",
    "foundingDate": "2025",
    "sameAs": [
      "https://x.com/UntitledTrading",
      "https://www.instagram.com/untitledtrading/",
      "https://www.linkedin.com/company/untitled-trading/"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://untitledtrading.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About",
        "item": "https://untitledtrading.com/about"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Careers",
        "item": "https://untitledtrading.com/careers"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Manifesto",
        "item": "https://untitledtrading.com/manifesto"
      }
    ]
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
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
    </>
  );
};

export default StructuredData;
