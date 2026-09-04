// ============================================================
// AgriOS — Government Schemes Intelligence Service
// Official Indian agricultural schemes, eligibility matching & guidelines
// ============================================================
import type { Farm } from '@/types';

export interface GovernmentScheme {
  id: string;
  name: string;
  officialTitle: string;
  category: 'income_support' | 'insurance' | 'credit' | 'soil_health' | 'irrigation' | 'organic' | 'equipment';
  benefitSummary: string;
  financialBenefit: string;
  eligibilityCriteria: string[];
  documentsRequired: string[];
  applicationPortal: string;
  implementingAgency: string;
  isEligible?: boolean;
  matchReason?: string;
}

export const INDIAN_GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    officialTitle: 'Pradhan Mantri Kisan Samman Nidhi',
    category: 'income_support',
    benefitSummary: 'Direct income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 directly to farmer bank accounts.',
    financialBenefit: '₹6,000 / year (Direct Bank Transfer)',
    eligibilityCriteria: [
      'All landholding farmer families with cultivable landholding in their names',
      'Small and marginal farmers across all states',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account linked with Aadhaar & NPCI',
      'Landholding documents / Khatauni / Jamabandi',
    ],
    applicationPortal: 'https://pmkisan.gov.in',
    implementingAgency: 'Department of Agriculture & Farmers Welfare, GoI',
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    officialTitle: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'insurance',
    benefitSummary: 'Comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest stages at nominal premium (1.5% for Rabi, 2% for Kharif, 5% for commercial/horticultural crops).',
    financialBenefit: 'Full sum insured coverage for crop loss / yield deficit',
    eligibilityCriteria: [
      'All farmers growing notified crops in notified areas',
      'Both loanee and non-loanee farmers eligible',
    ],
    documentsRequired: [
      'Land Records (RoR / Khasra-Khatauni)',
      'Sowing Certificate / Declaration',
      'Aadhaar Card & Bank Passbook',
    ],
    applicationPortal: 'https://pmfby.gov.in',
    implementingAgency: 'Ministry of Agriculture & designated General Insurance Companies',
  },
  {
    id: 'kcc',
    name: 'KCC',
    officialTitle: 'Kisan Credit Card Scheme',
    category: 'credit',
    benefitSummary: 'Timely and adequate credit to farmers for agricultural cultivation, post-harvest expenses, and farm maintenance with interest subvention up to ₹3 lakh at effective 4% interest rate on prompt repayment.',
    financialBenefit: 'Concessional credit up to ₹3 Lakh at 4% effective interest rate',
    eligibilityCriteria: [
      'All farmers — individuals/joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees & sharecroppers',
      'Self Help Groups or Joint Liability Groups of farmers',
    ],
    documentsRequired: [
      'Duly filled application form',
      'Proof of identity and address (Aadhaar/Voter ID)',
      'Land record documents duly certified by revenue authorities',
    ],
    applicationPortal: 'https://www.myscheme.gov.in/schemes/kcc',
    implementingAgency: 'NABARD & Commercial/Cooperative/Regional Rural Banks',
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card',
    officialTitle: 'Soil Health Card Scheme (National Project on Soil Health)',
    category: 'soil_health',
    benefitSummary: 'Periodic soil testing providing crop-wise recommendations of nutrients and fertilizers required for individual farm plots to reduce input costs and preserve soil microbiome.',
    financialBenefit: 'Free soil test report + custom NPK & micronutrient prescription',
    eligibilityCriteria: [
      'All farmers with agricultural landholding',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land record details for GPS-tagged soil sample',
    ],
    applicationPortal: 'https://soilhealth.dac.gov.in',
    implementingAgency: 'State Department of Agriculture & ICAR',
  },
  {
    id: 'pkvy',
    name: 'PKVY',
    officialTitle: 'Paramparagat Krishi Vikas Yojana (Traditional Agriculture Development)',
    category: 'organic',
    benefitSummary: 'Financial assistance of ₹50,000 per hectare for 3 years to adopt organic farming, biological inputs, certification, and direct marketing clusters.',
    financialBenefit: '₹50,000 / ha financial assistance over 3 years',
    eligibilityCriteria: [
      'Farmers practicing or transitioning to organic / natural farming',
      'Participation in 50-acre or 20-hectare farmer clusters',
    ],
    documentsRequired: [
      'Land Records',
      'Cluster Membership Certificate',
      'Bank details linked with DBT',
    ],
    applicationPortal: 'https://pgsindia-ncof.gov.in',
    implementingAgency: 'National Centre of Organic and Natural Farming',
  },
  {
    id: 'pmksy',
    name: 'PMKSY - Per Drop More Crop',
    officialTitle: 'Pradhan Mantri Krishi Sinchayee Yojana (PDMC)',
    category: 'irrigation',
    benefitSummary: 'Subsidy of up to 55% for small/marginal farmers and 45% for other farmers on micro-irrigation systems (drip and sprinkler) to maximize water use efficiency.',
    financialBenefit: 'Up to 55% subsidy on Drip & Sprinkler irrigation installations',
    eligibilityCriteria: [
      'All categories of farmers with assured water source',
      'Priority given to small and marginal farmers (<2 ha)',
    ],
    documentsRequired: [
      'Land ownership documents',
      'Water source availability certificate / electricity connection',
      'Aadhaar Card and Quotation from empanelled supplier',
    ],
    applicationPortal: 'https://pmksy.gov.in',
    implementingAgency: 'State Nodal Agencies for Micro-Irrigation',
  },
];

export function matchFarmerSchemes(farm: Farm): GovernmentScheme[] {
  return INDIAN_GOVERNMENT_SCHEMES.map(scheme => {
    let isEligible = true;
    let matchReason = 'Applicable based on your farm profile';

    if (scheme.id === 'pm-kisan') {
      isEligible = farm.areaHa > 0;
      matchReason = 'Eligible as a landholding farmer cultivating ' + farm.crop;
    } else if (scheme.id === 'pmfby') {
      isEligible = true;
      matchReason = `Notified crop (${farm.crop}) in ${farm.location.state || 'India'}`;
    } else if (scheme.id === 'pmksy') {
      if (farm.irrigationType === 'rainfed' || farm.irrigationType === 'flood') {
        isEligible = true;
        matchReason = `High priority: converting from ${farm.irrigationType} to micro-irrigation qualifies for up to 55% subsidy`;
      } else {
        isEligible = true;
        matchReason = 'Eligible for micro-irrigation equipment maintenance and upgrades';
      }
    } else if (scheme.id === 'pkvy') {
      if (farm.farmingPractice === 'organic' || farm.farmingPractice === 'regenerative') {
        isEligible = true;
        matchReason = 'Perfect match: you practice ' + farm.farmingPractice + ' farming';
      } else {
        isEligible = true;
        matchReason = 'Eligible if adopting organic input practices or bio-fertilizers';
      }
    }

    return {
      ...scheme,
      isEligible,
      matchReason,
    };
  });
}
