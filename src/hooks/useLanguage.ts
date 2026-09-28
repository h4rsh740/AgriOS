// ============================================================
// AgriOS — useLanguage hook & Bilingual Localization System
// Global reactive language preference shared across all components.
// Reads/writes localStorage key 'agrios_preferred_language'.
// Fires a custom DOM event so other tabs/components sync immediately.
// ============================================================
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type Lang = 'hi' | 'en';
const LS_KEY = 'agrios_preferred_language';
const EVENT_NAME = 'agrios:language-change';

// Comprehensive Bilingual UI Lexicon
export const UI_TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    // Nav Items
    'nav.dashboard': 'Dashboard',
    'nav.farm_twin': 'Farm Twin',
    'nav.ai_advisor': 'AI Advisor Q&A',
    'nav.weather': 'Weather',
    'nav.satellite': 'Satellite / NDVI',
    'nav.disease': 'Disease Investigator',
    'nav.simulate': 'What-If Simulation',
    'nav.regenerative': 'Regenerative Agriculture',
    'nav.roadmap': 'Roadmap',
    'nav.agrimesh': 'AgriMesh Network',
    'nav.settings': 'Settings',

    // Sidebar & Shell
    'app.tagline': 'Intelligence Platform',
    'app.active_farm': 'Active Farm',
    'app.alerts': 'active alerts',
    'app.sign_out': 'Sign out',
    'app.farmer': 'Farmer',
    'app.language': 'Language',
    'app.switch_hi': 'हिंदी में बदलें',
    'app.switch_en': 'Switch to English',

    // Dashboard
    'dashboard.title': 'Farmer Command Center',
    'dashboard.subtitle': 'Real-time telemetry, regenerative intelligence, and actionable recommendations',
    'dashboard.active_alerts': 'Active Alerts',
    'dashboard.all_systems_nominal': 'All systems nominal · No active hazards',
    'dashboard.live_weather': 'Live Weather',
    'dashboard.disease_pressure': 'Disease Pressure',
    'dashboard.vegetation_signal': 'Vegetation Signal',
    'dashboard.regen_score': 'Regenerative Score',
    'dashboard.mandi_prices': 'Mandi APMC Prices',
    'dashboard.govt_schemes': 'Matched Govt Schemes',
    'dashboard.ask_advisor': 'Ask AI Advisor',
    'dashboard.voice_btn': 'Voice Assistant',
    'dashboard.check_canopy': 'Check Canopy',
    'dashboard.healthy': 'Healthy',
    'dashboard.moderate': 'Moderate',
    'dashboard.high': 'High',
    'dashboard.critical': 'Critical',
    'dashboard.crop_health': 'Crop Health',
    'dashboard.soil_health': 'Soil Health',
    'dashboard.speak_ai': 'Speak to AI',
    'dashboard.add_farm': '+ Add Farm',
    'dashboard.open_twin': 'Open Twin Hub',
    'dashboard.demo_benchmark': 'Demo Benchmark',
    'dashboard.real_farm': 'Real Farm Twin',
    'dashboard.syncing': 'Syncing...',
    'dashboard.mandi_title': 'Mandi Prices',
    'dashboard.forecast_title': '7-Day Forecast',
    'dashboard.forecast_link': 'Detailed Forecast',
    'dashboard.schemes_title': 'Government Schemes for You',
    'dashboard.schemes_matched': 'Matched',
    'dashboard.schemes_eligible': 'Eligible',
    'dashboard.actions_title': 'Recommended Actions',
    'dashboard.roadmap_btn': '90-Day Roadmap →',
    'dashboard.modules_title': 'Farm Modules',
    'dashboard.module_disease': 'Disease Investigator',
    'dashboard.module_simulate': 'What-If Simulator',
    'dashboard.module_soil': 'Soil Health Profile',
    'dashboard.module_farms': 'All Farm Plots',
    'dashboard.module_disease_desc': 'Upload crop photo',
    'dashboard.module_simulate_desc': 'Compare farming scenarios',
    'dashboard.module_soil_desc': 'ISRIC soil chemistry',
    'dashboard.module_farms_desc': 'Switch or add farms',
    'dashboard.full_advisor': 'Full AI Advisor Report',
    'dashboard.confidence': 'Evidence Confidence',
    'dashboard.modal_price': 'Modal Price',
    'dashboard.quintal': '/ quintal',
    'dashboard.weekly_trend': 'weekly trend',
    'dashboard.good_morning': 'Good morning',
    'dashboard.good_afternoon': 'Good afternoon',
    'dashboard.good_evening': 'Good evening',

    // Settings
    'settings.title': 'Farmer Settings',
    'settings.subtitle': 'Manage your language, notification preferences, and system connectivity.',
    'settings.lang_heading': 'Language / भाषा',
    'settings.lang_desc': 'Choose the language for AI agricultural advice, alerts, and user interface.',
    'settings.lang_saved': 'Language preference updated and saved.',
    'settings.english': 'English',
    'settings.english_desc': 'Default interface language',
    'settings.hindi': 'हिंदी (Hindi)',
    'settings.hindi_desc': 'भारतीय किसानों के लिए संपूर्ण हिंदी अनुवाद',
    'settings.alerts_heading': 'Agricultural Alerts',
    'settings.weather_alerts': 'Extreme Weather & Monsoon Alerts',
    'settings.pest_alerts': 'Pest & Fungal Disease Risk Warnings',
    'settings.mandi_alerts': 'Mandi APMC Price Movements',
    'settings.scheme_alerts': 'New Government Scheme Notifications',
    'settings.profile_heading': 'Farmer Profile',
    'settings.system_heading': 'System Telemetry & Engine',
    'settings.display_name': 'Display Name',
    'settings.active_lang': 'Active Language',
    'settings.demo_farmer': 'Demo Farmer',
    'settings.weather_desc': 'Heavy rainfall, frost, and heat stress alerts',
    'settings.pest_desc': 'Microclimate triggers for foliar fungi or insect surges',
    'settings.mandi_desc': 'Alerts when nearby APMC prices cross MSP thresholds',
    'settings.scheme_desc': 'Deadlines for PM-KISAN, PMFBY, and input subsidies',

    // Advisor
    'advisor.title': 'AI Agricultural Advisor',
    'advisor.subtitle': 'Multi-agent Gemini analysis · Evidence-backed · Real weather + soil + satellite context',
    'advisor.analyze_btn': '⚡ Analyze with Gemini AI',
    'advisor.loading_ctx': 'Loading context…',
    'advisor.analyzing': 'Analyzing with Gemini…',
    'advisor.ask_agent': 'Ask Chief Agricultural Agent',
    'advisor.q1': 'What should I do today and why?',
    'advisor.q2': 'Should I irrigate given the 3-day rainfall forecast?',
    'advisor.q3': 'What foliar diseases should I inspect for?',
    'advisor.ask_placeholder': 'Ask anything about your crop, irrigation, weather, or soil...',
    'advisor.ask_btn': 'Ask',
    'advisor.evidence_trail': 'Evidence Trail',
    'advisor.sources': 'sources',
    'advisor.recommendations': 'Recommendations',
    'advisor.key_obs': 'Key Observations',
    'advisor.ai_confidence': 'AI Confidence',
    'advisor.gemini_response': 'Gemini Agent Response',
    'advisor.field_verify': 'Field verification recommended before implementing major changes.',
    'advisor.telemetry_dispute': 'Telemetry Dispute Detected',
    'advisor.confidence_penalized': 'Confidence Penalized',
    'advisor.warnings': 'Warnings',
    'advisor.urgency_today': 'Today',
    'advisor.urgency_week': 'This Week',
    'advisor.urgency_month': 'This Month',
    'advisor.live': 'Live',
    'advisor.demo': 'Demo',

    // AgriMesh
    'agrimesh.title': 'AgriMesh — BRICS Cooperation Network',
    'agrimesh.subtitle': 'Federated agricultural intelligence · Sovereign · Privacy-preserving · BRICS Nations',
    'agrimesh.share_btn': 'Share a Practice',
    'agrimesh.simulated': 'Simulated for Demo',
    'agrimesh.active': 'Active',
    'agrimesh.nodes': 'BRICS Nodes',
    'agrimesh.total_contrib': 'Total Contributions',
    'agrimesh.coop_model': 'Cooperative Model',
    'agrimesh.federated': 'Federated',
    'agrimesh.network_nodes': 'Network Nodes',
    'agrimesh.contributions': 'Contributions',
    'agrimesh.last_sync': 'Last Sync',
    'agrimesh.recent_contrib': 'Recent Contributions',
    'agrimesh.live_feed': 'Live AgriMesh Feed',
    'agrimesh.simulated_tag': 'Simulated',
    'agrimesh.connecting': 'Connecting to AgriMesh network...',
    'agrimesh.arch_title': 'AgriMesh Architecture — Federated Intelligence',
    'agrimesh.disclaimer': 'All AgriMesh nodes are simulated for demonstration purposes. The actual network would require bilateral agreements between participating nations.',
    'agrimesh.modal_title': 'Share Practice to AgriMesh',
    'agrimesh.modal_subtitle': 'Broadcast sovereign agronomic insights, disease patterns, or microclimate adaptations to the federated BRICS knowledge network.',
    'agrimesh.cat_label': 'Intelligence Category',
    'agrimesh.cat_practice': 'Agronomic Practice / Innovation',
    'agrimesh.cat_disease': 'Early Disease / Pest Pattern',
    'agrimesh.cat_climate': 'Microclimate & Drought Resilience',
    'agrimesh.cat_crop': 'Crop Phenology & Yield Heuristic',
    'agrimesh.title_label': 'Practice Title',
    'agrimesh.title_placeholder': 'e.g. Biochar furrow amendment for moisture retention',
    'agrimesh.crop_label': 'Crop / Commodity',
    'agrimesh.crop_placeholder': 'e.g. Wheat, Rice, Mustard',
    'agrimesh.region_label': 'Agro-Climatic Region',
    'agrimesh.region_placeholder': 'e.g. Uttar Pradesh (Central)',
    'agrimesh.desc_label': 'Detailed Agronomic Insight',
    'agrimesh.desc_placeholder': 'Explain the step-by-step technique, soil condition, or observed outcome...',
    'agrimesh.cancel': 'Cancel',
    'agrimesh.broadcast': 'Broadcast to Network',
    'agrimesh.err_title': 'Please provide a descriptive title (at least 4 characters).',
    'agrimesh.err_desc': 'Please describe the agronomic technique or observation (at least 15 characters).',

    // Farm Twin
    'farm.digital_twin': 'Farm Digital Twin',
    'farm.refresh': 'Refresh',
    'farm.twin_active': 'Twin Active',
    'farm.demo_data': 'Demo Data',
    'farm.open': 'Open',
    'farm.crop': 'Crop',
    'farm.stage': 'Stage',
    'farm.area': 'Area',
    'farm.location': 'Location',
    'farm.irrigation': 'Irrigation',
    'farm.practice': 'Practice',
    'farm.veg_signal': 'Current Vegetation Signal',
    'farm.soil_profile': 'Soil Profile',
    'farm.loading': 'Loading your farm twin…',
    'farm.loading_sub': 'Fetching weather, soil, and satellite context',
  },
  hi: {
    // Nav Items
    'nav.dashboard': 'डैशबोर्ड',
    'nav.farm_twin': 'फार्म ट्विन (खेत)',
    'nav.ai_advisor': 'एआई कृषि सलाहकार',
    'nav.weather': 'मौसम पूर्वानुमान',
    'nav.satellite': 'उपग्रह / एनडीवीआई',
    'nav.disease': 'फसल रोग जांच',
    'nav.simulate': 'सिमुलेशन / क्या-अगर',
    'nav.regenerative': 'पुनर्योजी कृषि',
    'nav.roadmap': 'मार्गदर्शिका (रोडमैप)',
    'nav.agrimesh': 'एग्रीमेश नेटवर्क',
    'nav.settings': 'सेटिंग्स',

    // Sidebar & Shell
    'app.tagline': 'कृषि बुद्धिमत्ता मंच',
    'app.active_farm': 'सक्रिय खेत',
    'app.alerts': 'सक्रिय अलर्ट',
    'app.sign_out': 'लॉग आउट',
    'app.farmer': 'किसान',
    'app.language': 'भाषा',
    'app.switch_hi': 'हिंदी',
    'app.switch_en': 'English',

    // Dashboard
    'dashboard.title': 'किसान कमांड सेंटर',
    'dashboard.subtitle': 'सटीक खेत निगरानी, पुनर्योजी कृषि सलाह और व्यावहारिक अनुशंसाएं',
    'dashboard.active_alerts': 'सक्रिय फसल अलर्ट',
    'dashboard.all_systems_nominal': 'सभी स्थितियां सामान्य · कोई सक्रिय खतरा नहीं',
    'dashboard.live_weather': 'मौसम की स्थिति',
    'dashboard.disease_pressure': 'रोग का जोखिम',
    'dashboard.vegetation_signal': 'फसल स्वास्थ्य (NDVI)',
    'dashboard.regen_score': 'पुनर्योजी कृषि स्कोर',
    'dashboard.mandi_prices': 'मंडी भाव (APMC)',
    'dashboard.govt_schemes': 'सरकारी योजनाएं',
    'dashboard.ask_advisor': 'सलाहकार से पूछें',
    'dashboard.voice_btn': 'बोलकर पूछें (आवाज)',
    'dashboard.check_canopy': 'कैनोपी जांचें',
    'dashboard.healthy': 'उत्कृष्ट',
    'dashboard.moderate': 'मध्यम',
    'dashboard.high': 'उच्च',
    'dashboard.critical': 'अत्यधिक गंभीर',
    'dashboard.crop_health': 'फसल स्वास्थ्य',
    'dashboard.soil_health': 'मृदा स्वास्थ्य',
    'dashboard.speak_ai': 'एआई से बोलें',
    'dashboard.add_farm': '+ खेत जोड़ें',
    'dashboard.open_twin': 'ट्विन खोलें',
    'dashboard.demo_benchmark': 'डेमो बेंचमार्क',
    'dashboard.real_farm': 'वास्तविक खेत ट्विन',
    'dashboard.syncing': 'सिंक हो रहा है...',
    'dashboard.mandi_title': 'मंडी भाव',
    'dashboard.forecast_title': '7-दिन पूर्वानुमान',
    'dashboard.forecast_link': 'विस्तृत पूर्वानुमान',
    'dashboard.schemes_title': 'आपके लिए सरकारी योजनाएं',
    'dashboard.schemes_matched': 'मिलान',
    'dashboard.schemes_eligible': 'पात्र',
    'dashboard.actions_title': 'अनुशंसित कार्य',
    'dashboard.roadmap_btn': '90-दिन रोडमैप →',
    'dashboard.modules_title': 'खेत मॉड्यूल',
    'dashboard.module_disease': 'रोग जांचकर्ता',
    'dashboard.module_simulate': 'क्या-अगर सिमुलेटर',
    'dashboard.module_soil': 'मृदा स्वास्थ्य प्रोफ़ाइल',
    'dashboard.module_farms': 'सभी खेत',
    'dashboard.module_disease_desc': 'फसल फोटो अपलोड करें',
    'dashboard.module_simulate_desc': 'खेती परिदृश्य तुलना करें',
    'dashboard.module_soil_desc': 'ISRIC मिट्टी रसायन',
    'dashboard.module_farms_desc': 'खेत बदलें या जोड़ें',
    'dashboard.full_advisor': 'पूर्ण एआई सलाहकार रिपोर्ट',
    'dashboard.confidence': 'साक्ष्य विश्वास स्तर',
    'dashboard.modal_price': 'मॉडल मूल्य',
    'dashboard.quintal': '/ क्विंटल',
    'dashboard.weekly_trend': 'साप्ताहिक प्रवृत्ति',
    'dashboard.good_morning': 'सुप्रभात',
    'dashboard.good_afternoon': 'शुभ दोपहर',
    'dashboard.good_evening': 'शुभ संध्या',

    // Settings
    'settings.title': 'किसान सेटिंग्स',
    'settings.subtitle': 'अपनी भाषा, सूचनाएं और सिस्टम कनेक्टिविटी प्रबंधित करें।',
    'settings.lang_heading': 'भाषा प्राथमिकता / Language',
    'settings.lang_desc': 'एआई कृषि सलाह, सूचनाएं और पूरे एप्लिकेशन इंटरफ़ेस के लिए भाषा चुनें।',
    'settings.lang_saved': 'भाषा प्राथमिकता सफलतापूर्वक सहेजी गई।',
    'settings.english': 'English (अंग्रेज़ी)',
    'settings.english_desc': 'मानक इंटरफ़ेस भाषा',
    'settings.hindi': 'हिंदी (Hindi)',
    'settings.hindi_desc': 'भारतीय किसानों के लिए संपूर्ण हिंदी अनुवाद',
    'settings.alerts_heading': 'कृषि सूचनाएं एवं अलर्ट',
    'settings.weather_alerts': 'मौसम चेतावनी और वर्षा अलर्ट',
    'settings.pest_alerts': 'कीट और कवक रोग जोखिम चेतावनी',
    'settings.mandi_alerts': 'मंडी भाव में उतार-चढ़ाव की सूचना',
    'settings.scheme_alerts': 'नई सरकारी योजनाओं की सूचना',
    'settings.profile_heading': 'किसान प्रोफ़ाइल',
    'settings.system_heading': 'सिस्टम टेलीमेट्री और कनेक्टिविटी',
    'settings.display_name': 'प्रदर्शन नाम',
    'settings.active_lang': 'सक्रिय भाषा',
    'settings.demo_farmer': 'डेमो किसान',
    'settings.weather_desc': 'भारी वर्षा, पाला और अत्यधिक तापमान अलर्ट',
    'settings.pest_desc': 'पत्तियों में फफूंद और कीट प्रकोप की पूर्व चेतावनी',
    'settings.mandi_desc': 'निकटतम APMC मंडियों में MSP मूल्य परिवर्तन अलर्ट',
    'settings.scheme_desc': 'PM-किसान, फसल बीमा योजना (PMFBY) समय-सीमा',

    // Advisor
    'advisor.title': 'एआई कृषि सलाहकार',
    'advisor.subtitle': 'बहु-एजेंट Gemini विश्लेषण · साक्ष्य-आधारित · वास्तविक मौसम + मिट्टी + उपग्रह संदर्भ',
    'advisor.analyze_btn': '⚡ Gemini AI से विश्लेषण करें',
    'advisor.loading_ctx': 'संदर्भ लोड हो रहा है…',
    'advisor.analyzing': 'Gemini से विश्लेषण हो रहा है…',
    'advisor.ask_agent': 'मुख्य कृषि एजेंट से पूछें',
    'advisor.q1': 'आज मुझे क्या करना चाहिए और क्यों?',
    'advisor.q2': '3-दिन की वर्षा पूर्वानुमान को देखते हुए क्या सिंचाई करूं?',
    'advisor.q3': 'किन पत्ती रोगों का निरीक्षण करना चाहिए?',
    'advisor.ask_placeholder': 'अपनी फसल, सिंचाई, मौसम या मिट्टी के बारे में कुछ भी पूछें...',
    'advisor.ask_btn': 'पूछें',
    'advisor.evidence_trail': 'साक्ष्य ट्रेल',
    'advisor.sources': 'स्रोत',
    'advisor.recommendations': 'अनुशंसाएं',
    'advisor.key_obs': 'मुख्य अवलोकन',
    'advisor.ai_confidence': 'एआई विश्वास स्तर',
    'advisor.gemini_response': 'Gemini एजेंट प्रतिक्रिया',
    'advisor.field_verify': 'बड़े बदलाव लागू करने से पहले क्षेत्र सत्यापन की अनुशंसा की जाती है।',
    'advisor.telemetry_dispute': 'टेलीमेट्री विवाद पाया गया',
    'advisor.confidence_penalized': 'विश्वास दंडित',
    'advisor.warnings': 'चेतावनियां',
    'advisor.urgency_today': 'आज',
    'advisor.urgency_week': 'इस सप्ताह',
    'advisor.urgency_month': 'इस महीने',
    'advisor.live': 'लाइव',
    'advisor.demo': 'डेमो',

    // AgriMesh
    'agrimesh.title': 'एग्रीमेश — BRICS सहयोग नेटवर्क',
    'agrimesh.subtitle': 'फेडरेटेड कृषि बुद्धिमत्ता · संप्रभु · गोपनीयता-संरक्षण · BRICS राष्ट्र',
    'agrimesh.share_btn': 'कृषि पद्धति साझा करें',
    'agrimesh.simulated': 'डेमो के लिए सिमुलेटेड',
    'agrimesh.active': 'सक्रिय',
    'agrimesh.nodes': 'BRICS नोड्स',
    'agrimesh.total_contrib': 'कुल योगदान',
    'agrimesh.coop_model': 'सहकारी मॉडल',
    'agrimesh.federated': 'फेडरेटेड',
    'agrimesh.network_nodes': 'नेटवर्क नोड्स',
    'agrimesh.contributions': 'योगदान',
    'agrimesh.last_sync': 'अंतिम सिंक',
    'agrimesh.recent_contrib': 'हालिया योगदान',
    'agrimesh.live_feed': 'लाइव एग्रीमेश फ़ीड',
    'agrimesh.simulated_tag': 'सिमुलेटेड',
    'agrimesh.connecting': 'एग्रीमेश नेटवर्क से जुड़ रहे हैं...',
    'agrimesh.arch_title': 'एग्रीमेश आर्किटेक्चर — फेडरेटेड बुद्धिमत्ता',
    'agrimesh.disclaimer': 'सभी एग्रीमेश नोड्स प्रदर्शन उद्देश्यों के लिए सिमुलेटेड हैं। वास्तविक नेटवर्क के लिए भाग लेने वाले देशों के बीच द्विपक्षीय समझौते आवश्यक होंगे।',
    'agrimesh.modal_title': 'एग्रीमेश पर पद्धति साझा करें',
    'agrimesh.modal_subtitle': 'BRICS फेडरेटेड ज्ञान नेटवर्क पर संप्रभु कृषि ज्ञान, रोग पैटर्न या माइक्रोक्लाइमेट अनुकूलन प्रसारित करें।',
    'agrimesh.cat_label': 'बुद्धिमत्ता श्रेणी',
    'agrimesh.cat_practice': 'कृषि पद्धति / नवाचार',
    'agrimesh.cat_disease': 'प्रारंभिक रोग / कीट पैटर्न',
    'agrimesh.cat_climate': 'माइक्रोक्लाइमेट और सूखा प्रतिरोध',
    'agrimesh.cat_crop': 'फसल फेनोलॉजी और उपज अनुमान',
    'agrimesh.title_label': 'पद्धति शीर्षक',
    'agrimesh.title_placeholder': 'जैसे: नमी संरक्षण के लिए बायोचार खांचा संशोधन',
    'agrimesh.crop_label': 'फसल / वस्तु',
    'agrimesh.crop_placeholder': 'जैसे: गेहूं, चावल, सरसों',
    'agrimesh.region_label': 'कृषि-जलवायु क्षेत्र',
    'agrimesh.region_placeholder': 'जैसे: उत्तर प्रदेश (मध्य)',
    'agrimesh.desc_label': 'विस्तृत कृषि ज्ञान',
    'agrimesh.desc_placeholder': 'चरण-दर-चरण तकनीक, मिट्टी की स्थिति या देखे गए परिणाम बताएं...',
    'agrimesh.cancel': 'रद्द करें',
    'agrimesh.broadcast': 'नेटवर्क पर प्रसारित करें',
    'agrimesh.err_title': 'कृपया एक वर्णनात्मक शीर्षक दें (कम से कम 4 अक्षर)।',
    'agrimesh.err_desc': 'कृपया कृषि तकनीक या अवलोकन का वर्णन करें (कम से कम 15 अक्षर)।',

    // Farm Twin
    'farm.digital_twin': 'खेत डिजिटल ट्विन',
    'farm.refresh': 'रिफ्रेश',
    'farm.twin_active': 'ट्विन सक्रिय',
    'farm.demo_data': 'डेमो डेटा',
    'farm.open': 'खोलें',
    'farm.crop': 'फसल',
    'farm.stage': 'अवस्था',
    'farm.area': 'क्षेत्रफल',
    'farm.location': 'स्थान',
    'farm.irrigation': 'सिंचाई',
    'farm.practice': 'कृषि पद्धति',
    'farm.veg_signal': 'वर्तमान वनस्पति संकेत',
    'farm.soil_profile': 'मृदा प्रोफ़ाइल',
    'farm.loading': 'खेत ट्विन लोड हो रहा है…',
    'farm.loading_sub': 'मौसम, मिट्टी और उपग्रह संदर्भ प्राप्त किया जा रहा है',
  },
};

export function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const val = localStorage.getItem(LS_KEY);
    if (val === 'hi' || val === 'en') return val;
  } catch {
    // fallback
  }
  return 'en';
}

export type UseLanguageReturn = [Lang, (l: Lang) => void] & {
  language: Lang;
  setLanguage: (l: Lang) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
};

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    const initial = readStoredLang();
    setLanguageState(initial);

    function onExternalChange(e: Event) {
      const newLang = (e as CustomEvent<Lang>).detail;
      if (newLang === 'hi' || newLang === 'en') {
        setLanguageState(newLang);
      }
    }

    function onStorageChange(e: StorageEvent) {
      if (e.key === LS_KEY && (e.newValue === 'hi' || e.newValue === 'en')) {
        setLanguageState(e.newValue);
      }
    }

    window.addEventListener(EVENT_NAME, onExternalChange);
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onExternalChange);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const setLanguage = useCallback((newLang: Lang) => {
    try {
      localStorage.setItem(LS_KEY, newLang);
    } catch {
      // ignore
    }
    setLanguageState(newLang);
    window.dispatchEvent(new CustomEvent<Lang>(EVENT_NAME, { detail: newLang }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
      return dict[key] || fallback || key;
    },
    [language]
  );

  return useMemo(() => {
    const arr = [language, setLanguage] as [Lang, (l: Lang) => void];
    return Object.assign(arr, {
      language,
      setLanguage,
      toggleLanguage,
      t,
    });
  }, [language, setLanguage, toggleLanguage, t]);
}
