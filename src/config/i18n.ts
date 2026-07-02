import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Jumuika",
      "welcome": "Welcome back",
      "total_balance": "Total Balance",
      "active_contributors": "Active Contributors",
      "upcoming_events": "Upcoming Events",
      "recent_payments": "Recent Payments",
      "create_event": "Create Event",
      "dashboard": "Dashboard",
      "contributors": "Contributors",
      "payments": "Payments",
      "events": "Events",
      "settings": "Settings",
      "logout": "Logout",
      "search": "Search...",
      "add_payment": "Add Payment",
      "add_contributor": "Add Contributor",
      "quick_record": "Quick Record",
      "export_data": "Export Data",
      "export_contributors": "Export Members (CSV)",
      "export_payments": "Export Payments (CSV)",
      "export_schedules": "Export Schedules (CSV)",
      "select_contributor": "Select Contributor",
      "search_contributor": "Search contributor...",
      "status": {
        "completed": "Completed",
        "partial": "Partial",
        "upcoming": "Upcoming",
        "due": "Due",
        "overdue": "Overdue"
      },
      "landing": {
        "badge": "Secure Multi-User Contribution Engine",
        "headline_1": "Coordinate Scheduled",
        "headline_2": "Contribution Targets",
        "subtext": "Track expected payments, configure custom installment plans, cascade payment cashflows, and run detailed audit reports—all in one platform.",
        "start_free": "Start For Free",
        "launch_dashboard": "Launch Dashboard",
        "explore_features": "Explore Features",
        "sign_in": "Sign In",
        "stats": {
          "accuracy": "Data accuracy",
          "sync": "Live sync",
          "events": "Event support"
        },
        "features": {
          "badge": "Built for Impact",
          "title": "Engineered for Modern Logistics",
          "subtitle": "Everything you need to manage funds, contributors, and multi-layered event schedules without losing your mind.",
          "registry": {
            "title": "Contributor Registry",
            "desc": "Manage profiles, contacts, and personal contribution ledgers in a single consolidated workspace."
          },
          "schedules": {
            "title": "Structured Schedules",
            "desc": "Split contribution targets into custom installment calendars—daily, weekly, or monthly—automatically."
          },
          "waterfall": {
            "title": "Waterfall Payments",
            "desc": "Record payments that cascade and waterfall down outstanding dues, offsetting upcoming scheduled balances."
          },
          "dashboards": {
            "title": "Insightful Dashboards",
            "desc": "Track receipt timelines, balances, and calendar milestones with granular auditing dashboards in real time."
          }
        },
        "testimonials": {
          "title": "Trusted by Community Leaders"
        },
        "cta": {
          "title": "Ready to get started?",
          "subtitle": "Join other organizers who trust Jumuika to manage their contribution events with clarity and confidence.",
          "perks": ["Free to use", "No credit card", "Cloud secured", "Mobile ready"],
          "button_guest": "Get Started Free",
          "button_user": "Go to Dashboard"
        },
        "footer": {
          "tagline": "Modern Event & Contributor Management",
          "privacy": "Privacy"
        }
      }
    }
  },
  sw: {
    translation: {
      "app_name": "Jumuika",
      "welcome": "Karibu tena",
      "total_balance": "Jumla ya Salio",
      "active_contributors": "Wachangiaji Hai",
      "upcoming_events": "Matukio Yajayo",
      "recent_payments": "Malipo ya Hivi Karibuni",
      "create_event": "Unda Tukio",
      "dashboard": "Dashibodi",
      "contributors": "Wachangiaji",
      "payments": "Malipo",
      "events": "Matukio",
      "settings": "Mipangilio",
      "logout": "Toka",
      "search": "Tafuta...",
      "add_payment": "Ongeza Malipo",
      "add_contributor": "Ongeza Mchangiaji",
      "quick_record": "Rekodi Haraka",
      "export_data": "Pakua Takwimu",
      "export_contributors": "Pakua Wachangiaji (CSV)",
      "export_payments": "Pakua Malipo (CSV)",
      "export_schedules": "Pakua Ratiba (CSV)",
      "select_contributor": "Chagua Mchangiaji",
      "search_contributor": "Tafuta mchangiaji...",
      "status": {
        "completed": "Imekamilika",
        "partial": "Kiasi",
        "upcoming": "Inayokuja",
        "due": "Inastahili",
        "overdue": "Imechelewa"
      },
      "landing": {
        "badge": "Mfumo Salama wa Michango ya Watumiaji Wengi",
        "headline_1": "Kuratibu Malengo ya",
        "headline_2": "Michango Iliyopangwa",
        "subtext": "Fuatilia malipo yanayotarajiwa, weka mipango maalum ya awamu, unganisha mtiririko wa malipo, na upate ripoti za kina—yote katika jukwaa moja.",
        "start_free": "Anza Bure",
        "launch_dashboard": "Fungua Dashibodi",
        "explore_features": "Chunguza Vipengele",
        "sign_in": "Ingia",
        "stats": {
          "accuracy": "Usahihi wa data",
          "sync": "Usawazishaji hai",
          "events": "Matukio yote"
        },
        "features": {
          "badge": "Imejengwa kwa Matokeo",
          "title": "Imeundwa kwa Ajili ya Usimamizi wa Kisasa",
          "subtitle": "Kila kitu unachohitaji kusimamia fedha, wachangiaji, na ratiba za matukio bila usumbufu.",
          "registry": {
            "title": "Daftari la Wachangiaji",
            "desc": "Simamia wasifu, anwani, na leja binafsi za michango katika sehemu moja."
          },
          "schedules": {
            "title": "Ratiba Zilizopangwa",
            "desc": "Gawanya malengo ya michango katika kalenda maalum za awamu—kila siku, wiki, au mwezi—moja kwa moja."
          },
          "waterfall": {
            "title": "Malipo ya Mfululizo",
            "desc": "Rekodi malipo yanayopunguza madeni yaliyosalia kwa mfululizo, na kusawazisha salio linalofuata."
          },
          "dashboards": {
            "title": "Dashibodi za Kina",
            "desc": "Fuatilia muda wa risiti, salio, na hatua za kalenda kwa ripoti za wakati halisi."
          }
        },
        "testimonials": {
          "title": "Inaaminiwa na Viongozi wa Jamii"
        },
        "cta": {
          "title": "Uko tayari kuanza?",
          "subtitle": "Jiunge na waratibu wengine wanaotumia Jumuika kudhibiti matukio yao ya michango kwa uhakika.",
          "perks": ["Bure kutumia", "Hakuna kadi ya mkopo", "Usalama wa Wingu", "Inafanya kazi kwa simu"],
          "button_guest": "Anza Bure",
          "button_user": "Nenda Dashibodi"
        },
        "footer": {
          "tagline": "Usimamizi wa Kisasa wa Matukio na Wachangiaji",
          "privacy": "Faragha"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
