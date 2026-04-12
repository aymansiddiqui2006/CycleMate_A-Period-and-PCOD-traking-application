import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    nav_calendar: "Calendar",
    nav_doctors: "Doctors",
    nav_order: "Order",
    nav_report: "Report",
    nav_logout: "Logout",
    welcome: "Welcome Back",
    download_pdf: "Download Medical PDF",
    ai_alert: "AI Health Alert",
    cycle_stats: "Cycle Statistics",
    days_avg: "days avg",
    tracking_calendar: "Tracking Calendar",
    trends: "Length Trends Overview",
    high_risk_msg: "Your last few cycles show irregular patterns. You are at high risk of PCOD. Please consult a doctor!",
    moderate_risk_msg: "We noticed some slight irregularities in your cycle. Keep monitoring closely.",
    normal_msg: "Your cycles have been tracking normally! Keep up the excellent work.",
    chatbot_greeting: "Hey! I am Sakhi. How may I help you today?",
    chatbot_placeholder: "Ask Sakhi something...",
    doctors_title: "Top Rated Doctors",
    orders_title: "Quick Delivery",
    order_badge: "Order in 20 min",
    report_title: "Your Health Report",
    export_pdf: "Export PDF",
    log_period: "Log Period",
    streak_msg: "day logging streak",
    start_journey: "Start your health journey!",
    log_first: "Log Your First Period",
    no_data: "No cycle data yet",
    available_today: "Available Today",
    book_appointment: "Book Appointment",
    all: "All",
    coming_soon: "Coming Soon!",
  },
  hi: {
    nav_calendar: "कैलेंडर",
    nav_doctors: "डॉक्टर",
    nav_order: "ऑर्डर",
    nav_report: "रिपोर्ट",
    nav_logout: "लॉगआउट",
    welcome: "वापस स्वागत है",
    download_pdf: "मेडिकल PDF डाउनलोड करें",
    ai_alert: "AI स्वास्थ्य अलर्ट",
    cycle_stats: "साइकिल आँकड़े",
    days_avg: "दिन औसत",
    tracking_calendar: "ट्रैकिंग कैलेंडर",
    trends: "साइकिल लंबाई का विश्लेषण",
    high_risk_msg: "आपके पिछले कुछ चक्र अनियमित हैं। PCOD का उच्च जोखिम है। डॉक्टर से मिलें!",
    moderate_risk_msg: "कुछ अनियमितताएं देखी गई हैं। ध्यान से निगरानी करें।",
    normal_msg: "आपके चक्र सामान्य हैं! बढ़िया काम जारी रखें।",
    chatbot_greeting: "नमस्ते! मैं साखी हूं। आज मैं आपकी कैसे मदद कर सकती हूं?",
    chatbot_placeholder: "साखी से कुछ पूछें...",
    doctors_title: "शीर्ष रेटेड डॉक्टर",
    orders_title: "त्वरित डिलीवरी",
    order_badge: "20 मिनट में ऑर्डर करें",
    report_title: "आपकी स्वास्थ्य रिपोर्ट",
    export_pdf: "PDF निर्यात करें",
    log_period: "पीरियड लॉग करें",
    streak_msg: "दिन की लॉगिंग स्ट्रीक",
    start_journey: "अपनी स्वास्थ्य यात्रा शुरू करें!",
    log_first: "पहला पीरियड लॉग करें",
    no_data: "अभी तक कोई डेटा नहीं",
    available_today: "आज उपलब्ध",
    book_appointment: "अपॉइंटमेंट बुक करें",
    all: "सभी",
    coming_soon: "जल्द आ रहा है!",
  },
  pa: {
    nav_calendar: "ਕੈਲੰਡਰ",
    nav_doctors: "ਡਾਕਟਰ",
    nav_order: "ਆਰਡਰ",
    nav_report: "ਰਿਪੋਰਟ",
    nav_logout: "ਲੌਗਆਉਟ",
    welcome: "ਵਾਪਸ ਜੀ ਆਇਆਂ",
    download_pdf: "ਮੈਡੀਕਲ PDF ਡਾਊਨਲੋਡ ਕਰੋ",
    ai_alert: "AI ਸਿਹਤ ਅਲਰਟ",
    cycle_stats: "ਚੱਕਰ ਅੰਕੜੇ",
    days_avg: "ਦਿਨ ਔਸਤ",
    tracking_calendar: "ਟਰੈਕਿੰਗ ਕੈਲੰਡਰ",
    trends: "ਚੱਕਰ ਲੰਬਾਈ ਵਿਸ਼ਲੇਸ਼ਣ",
    high_risk_msg: "ਤੁਹਾਡੇ ਪਿਛਲੇ ਚੱਕਰ ਅਨਿਯਮਿਤ ਹਨ। PCOD ਦਾ ਉੱਚ ਖ਼ਤਰਾ ਹੈ। ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ!",
    moderate_risk_msg: "ਕੁਝ ਅਨਿਯਮਿਤਤਾਵਾਂ ਦੇਖੀਆਂ ਗਈਆਂ। ਧਿਆਨ ਨਾਲ ਨਿਗਰਾਨੀ ਕਰੋ।",
    normal_msg: "ਤੁਹਾਡੇ ਚੱਕਰ ਸਾਧਾਰਨ ਹਨ! ਸ਼ਾਨਦਾਰ ਕੰਮ ਜਾਰੀ ਰੱਖੋ।",
    chatbot_greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸਾਖੀ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?",
    chatbot_placeholder: "ਸਾਖੀ ਤੋਂ ਕੁਝ ਪੁੱਛੋ...",
    doctors_title: "ਚੋਟੀ ਦੇ ਡਾਕਟਰ",
    orders_title: "ਤੇਜ਼ ਡਿਲੀਵਰੀ",
    order_badge: "20 ਮਿੰਟ ਵਿੱਚ ਆਰਡਰ ਕਰੋ",
    report_title: "ਤੁਹਾਡੀ ਸਿਹਤ ਰਿਪੋਰਟ",
    export_pdf: "PDF ਨਿਰਯਾਤ ਕਰੋ",
    log_period: "ਪੀਰੀਅਡ ਲੌਗ ਕਰੋ",
    streak_msg: "ਦਿਨ ਦੀ ਲੌਗਿੰਗ ਸਟ੍ਰੀਕ",
    start_journey: "ਆਪਣੀ ਸਿਹਤ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ!",
    log_first: "ਪਹਿਲਾ ਪੀਰੀਅਡ ਲੌਗ ਕਰੋ",
    no_data: "ਅਜੇ ਕੋਈ ਡੇਟਾ ਨਹੀਂ",
    available_today: "ਅੱਜ ਉਪਲਬਧ",
    book_appointment: "ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    all: "ਸਾਰੇ",
    coming_soon: "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ!",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('cyclesakhi_lang') || 'en');

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('cyclesakhi_lang', lang);
  }, []);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export default LanguageContext;
