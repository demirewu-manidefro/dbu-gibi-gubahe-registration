import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    canonical,
    ogType = 'website',
    ogImage = '/logo-mk.jpg',
    lang = 'am'
}) => {
    const siteName = 'የደብረ ብርሀን ዩኒቨርስቲ የቀን ጊቢ ጉባኤ';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const siteUrl = 'https://dbu-gibi-gubae.org';
    const fullUrl = `${siteUrl}${canonical || window.location.pathname}`;

    // Default description if none provided
    const defaultDesc = lang === 'am'
        ? 'የደብረ ብርሀን ዩኒቨርስቲ የቀን ጊቢ ጉባኤ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን አስተምህሮን እና ሥርዓትን በመጠበቅ፣ ለዩኒቨርስቲ ተማሪዎች መንፈሳዊ አገልግሎት ለመስጠት እና በዕውቀት የታነጸ ተተኪ ትውልድ ለማፍራት የሚተጋ መንፈሳዊ ማህበር ነው።'
        : 'Debre Berhan University Regular Day Gibi Gubae is a spiritual fellowship of the Ethiopian Orthodox Tewahedo Church dedicated to providing student , fostering spiritual growth, and nurturing a knowledgeable generation to serve the Church.';

    const finalDesc = description || defaultDesc;

    // Default keywords
    const defaultKeywords = lang === 'am'
        ? 'የደብረ ብርሀን ዩኒቨርስቲ, ግቢ ጉባኤ, ማኅበረ ቅዱሳን, ኦርቶዶክስ, ተማሪዎች, ሃይማኖት, ኢትዮጵያ, የቀን ጊቢ ጉባኤ,'
        : 'Debre Berhan University, Gibi Gubae, Mahibere Kidusan, Orthodox Tewahedo, Student Ministry, Ethiopia, Campus Fellowship';

    // JSON-LD Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": ["ReligiousOrganization", "EducationalOrganization"],
        "name": "DBU Regular Day Gibi Gubae",
        "alternateName": ["የደብረ ብርሀን ዩኒቨርስቲ የቀን ጊቢ ጉባኤ", "DBU Gibi Gubae"],
        "url": siteUrl,
        "logo": `${siteUrl}/logo-mk.jpg`,
        "description": finalDesc,
        "parentOrganization": {
            "@type": "ReligiousOrganization",
            "name": "Mahibere Kidusan",
            "alternateName": "ማኅበረ ቅዱሳን"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Behind St. Gabriel Church",
            "addressLocality": "Debre Berhan",
            "addressRegion": "Amhara",
            "postalCode": "445",
            "addressCountry": "ET"
        },
        "sameAs": [
            "https://web.facebook.com/debbirunigibygubaye/"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Student Affairs",
            "areaServed": "ET",
            "availableLanguage": ["Amharic", "English"]
        }
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <html lang={lang} />
            <title>{fullTitle}</title>
            <meta name="description" content={finalDesc} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
            <meta property="og:site_name" content="DBU Gibi Gubae" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
