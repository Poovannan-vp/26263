// Short UI strings in English and Hindi. Pages not listed here stay in English.
export type Lang = "en" | "hi";

const DICT: Record<string, { en: string; hi: string }> = {
  home: { en: "Home", hi: "होम" },
  demo: { en: "Guided demo", hi: "गाइडेड डेमो" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  national: { en: "National view", hi: "राष्ट्रीय दृश्य" },
  institution: { en: "Institution", hi: "संस्थान" },
  upload: { en: "Upload records", hi: "रिकॉर्ड अपलोड" },
  benchmark: { en: "Load test", hi: "लोड टेस्ट" },
  verifier: { en: "Verifier", hi: "सत्यापनकर्ता" },
  consent: { en: "My consent", hi: "मेरी सहमति" },
  certificate: { en: "Certificate", hi: "प्रमाणपत्र" },
  reports: { en: "Reports", hi: "रिपोर्ट" },
  admin: { en: "Admin", hi: "प्रशासन" },
  scale: { en: "Scale", hi: "स्केल" },
  signin: { en: "Sign in", hi: "साइन इन" },
  signout: { en: "Sign out", hi: "साइन आउट" },
  start_demo: { en: "Start guided demo", hi: "गाइडेड डेमो शुरू करें" },
  simulated: { en: "SIMULATED DATA", hi: "सिमुलेटेड डेटा" },
  export_csv: { en: "Export CSV", hi: "CSV निर्यात करें" },
  print_pdf: { en: "Print or save as PDF", hi: "प्रिंट या PDF" },
  locked: { en: "Not permitted for your role", hi: "आपकी भूमिका के लिए अनुमति नहीं" },
  accepted: { en: "Accepted", hi: "स्वीकृत" },
  correctable: { en: "Correctable", hi: "सुधार योग्य" },
  review: { en: "Needs review", hi: "समीक्षा आवश्यक" },
  unverified: { en: "Unverified seats", hi: "असत्यापित सीटें" },
  intake: { en: "Approved intake", hi: "स्वीकृत प्रवेश सीटें" },
  active: { en: "Active enrolment", hi: "सक्रिय नामांकन" },
};

export function tr(lang: Lang, key: string): string {
  const entry = DICT[key];
  return entry ? entry[lang] : key;
}
