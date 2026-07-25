/**
 * legalContent.js
 * Content for the site's informational pages, ported from
 * imageyantra-main (About, Privacy Policy, Terms of Use) with a
 * new Disclaimer page written to match, since the original site
 * linked to one from its footer but never built it either.
 */

export const LEGAL_PAGES = {
  about: {
    title: 'About ImageYantra',
    sub: 'A free, private, browser-based toolkit for everyone who works with images and PDFs every day.',
    sections: [
      {
        h: 'What is ImageYantra?',
        p: [
          'ImageYantra is a collection of free tools for image and PDF processing. From compressing photos for social media to merging PDF reports, most tools run directly in your browser — no files uploaded, no account required. A couple of tools (Compress PDF, Remove Background) use server-side processing because the job genuinely needs it; those files are deleted immediately after.',
          "We believe powerful tools should be accessible to everyone. Whether you're a designer, student, small business owner, or just someone who occasionally needs to resize a photo, ImageYantra gives you professional results without the complexity or cost.",
        ],
      },
      {
        h: 'Why We Built This',
        p: [
          'Most online image tools require you to upload your files to a third-party server. That raises privacy concerns and introduces unnecessary delays. We built ImageYantra to be different — every operation uses modern browser APIs (Canvas, PDF.js, jsPDF) to process your files locally, on your own device.',
          'The result is a tool that is faster, more private, and works even with slow internet connections — because your file never leaves your browser.',
        ],
      },
      {
        h: 'Our Tools',
        p: ['ImageYantra currently includes tools for:'],
        list: [
          'Compressing images to reduce file size without visible quality loss',
          'Resizing images to exact pixel dimensions',
          'Cropping images with drag-and-drop selection and preset aspect ratios',
          'Rotating and flipping images in any direction',
          'Changing resolution to 720p, 1080p, 4K, or custom sizes',
          'Converting images to PDF with custom page sizes',
          'Merging PDFs into a single document',
          'Rearranging PDF pages by drag and drop',
          'Adding or removing pages from any PDF',
          'Resizing photos, signatures, and documents to exact exam board specifications',
        ],
      },
      {
        h: 'Our Values',
        p: [
          'Privacy first — most tools never send your files anywhere; the few that need server-side processing delete files immediately after and never retain them.',
          'Generous free tier — every tool is free to use today, with no sign-up required.',
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    sub: "Last updated: May 2026. We take your privacy seriously — here's everything you need to know.",
    sections: [
      {
        h: 'The Short Version',
        p: ['Most ImageYantra tools process your files locally in your browser — nothing is uploaded. A few tools (Compress PDF, Remove Background) use server-side processing for results a browser can\u2019t produce alone; those files are deleted immediately after processing and are never stored, viewed, or shared.'],
      },
      {
        h: 'Information We Collect',
        p: ['We collect minimal, anonymized data to understand how our tools are used and to improve the site:'],
        list: [
          'Usage analytics: anonymous page views, tool usage frequency, and browser type via standard web analytics (no personal identifiers).',
          'Contact form submissions: if you contact us, we store your name, email, and message to respond to your inquiry.',
          'Cookies: we use cookies for Google AdSense (advertising) and basic analytics. You can disable cookies in your browser settings.',
        ],
      },
      {
        h: 'What We Do NOT Collect',
        list: [
          'Your images, documents, or any files you process with our tools',
          "Account information (we don't have accounts)",
          'Payment information (our tools are free)',
          'Location data beyond country-level',
        ],
      },
      {
        h: 'Local Processing',
        p: ['Most image and PDF operations use browser-native APIs (Canvas API, Web Workers, jsPDF, PDF-lib) — your files are loaded into browser memory, processed, and downloaded entirely on your device, with no network request made with your file data. Two tools are the exception: Compress PDF (server-side Ghostscript) and Remove Background (a server-side AI model too large to run well in-browser). For both, the file is deleted immediately after the result is returned to you \u2014 we do not retain, view, or log the contents of anything you process.'],
      },
      {
        h: 'Advertising',
        p: ["We display ads via Google AdSense to support the free service. Google may use cookies and browsing data to show relevant ads. You can opt out via Google's Ads Settings. We do not have access to any data Google collects for advertising purposes."],
      },
      {
        h: 'Third-Party Services',
        list: [
          "Google AdSense: advertising — subject to Google's Privacy Policy",
          "Google Fonts: typography — fonts are loaded from Google's CDN",
          'CDN-hosted libraries: PDF and image-processing libraries (pdf-lib, jsPDF, pdf.js) are loaded from public CDNs',
        ],
      },
      {
        h: "Children's Privacy",
        p: ['ImageYantra is not directed to children under 13. We do not knowingly collect personal information from children.'],
      },
      {
        h: 'Changes to This Policy',
        p: ['We may update this policy periodically. Changes will be noted with an updated date at the top of this page. Continued use of ImageYantra after changes constitutes acceptance of the updated policy.'],
      },
      {
        h: 'Contact',
        p: ['Questions about this policy? Reach us at contact@imageyantra.in and we\u2019ll respond promptly.'],
      },
    ],
  },

  terms: {
    title: 'Terms of Use',
    sub: 'Last updated: May 2026. Please read these terms before using ImageYantra.',
    sections: [
      {
        h: 'Acceptance of Terms',
        p: ['By accessing or using ImageYantra ("the Service"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Service.'],
      },
      {
        h: 'Description of Service',
        p: ['ImageYantra provides free, browser-based tools for image and PDF processing. Most processing occurs locally in your browser; Compress PDF and Remove Background are processed server-side and the file is deleted immediately after. We do not store or retain any files you process.'],
      },
      {
        h: 'Permitted Use',
        p: ['You may use ImageYantra for personal, educational, and commercial purposes provided that you:'],
        list: [
          'Do not use the Service for any illegal purpose',
          'Do not attempt to disrupt or overload our infrastructure',
          'Do not use automated scripts to scrape or abuse the Service',
          'Only process files that you own or have permission to process',
        ],
      },
      {
        h: 'Intellectual Property',
        p: ['The ImageYantra name, logo, design, and code are owned by ImageYantra. You may not copy, reproduce, or distribute our proprietary materials without written permission. The open-source libraries we use remain subject to their respective licenses.'],
      },
      {
        h: 'Disclaimer of Warranties',
        p: ['The Service is provided "as is" without any warranty of any kind, express or implied. We do not guarantee that the Service will be error-free, uninterrupted, or that the output will meet your specific requirements.'],
      },
      {
        h: 'Limitation of Liability',
        p: ['ImageYantra shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of data or files.'],
      },
      {
        h: 'Privacy',
        p: ['Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.'],
      },
      {
        h: 'Changes to Terms',
        p: ['We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.'],
      },
      {
        h: 'Contact',
        p: ['Questions about these Terms? Reach us at contact@imageyantra.in.'],
      },
    ],
  },

  disclaimer: {
    title: 'Disclaimer',
    sub: 'Please read this disclaimer carefully before relying on results from ImageYantra tools.',
    sections: [
      {
        h: 'No Guarantee of Acceptance',
        p: ['Our Exam Tools resize photos, signatures, and documents to published dimension and file-size specifications for various exam boards and government forms. We make a good-faith effort to keep these specifications accurate and up to date, but exam authorities can change their requirements at any time without notice.'],
      },
      {
        h: 'Your Responsibility',
        p: ['It is your responsibility to verify the current official specification on the relevant exam or government website before submitting any document, photo, or signature produced with ImageYantra. We are not responsible for application rejections, delays, or other consequences resulting from outdated or incorrect specifications.'],
      },
      {
        h: 'Not an Official Service',
        p: ['ImageYantra is an independent tool and is not affiliated with, endorsed by, or officially connected to UPSC, SSC, IBPS, any state public service commission, or any other examination or government authority referenced on this site. All trademarks and exam names belong to their respective owners and are used only for descriptive purposes.'],
      },
      {
        h: 'General Tools',
        p: ['For general image and PDF tools (compress, resize, crop, merge, and similar), output quality depends on your source file and the settings you choose. We recommend reviewing results before using them for important purposes.'],
      },
      {
        h: 'Contact',
        p: ['If you spot an outdated exam specification, please let us know at contact@imageyantra.in so we can correct it.'],
      },
    ],
  },
};
