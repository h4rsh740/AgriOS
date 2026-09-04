// ============================================================
// AgriOS — Core Agricultural Intelligence Test Suite
// Verified using Node.js native test runner
// ============================================================
import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Agronomic Crop Knowledge Base
test('Crop Knowledge Base returns valid agronomic profiles', async () => {
  const { CROP_PROFILES, getCropAgronomy } = await import('../src/lib/services/agriculture/cropService.ts');
  assert.ok(CROP_PROFILES.Wheat, 'Wheat profile exists');
  assert.equal(CROP_PROFILES.Wheat.season, 'Rabi');
  assert.ok(CROP_PROFILES.Wheat.waterRequirementMm > 0);

  const lookup = getCropAgronomy('Rice');
  assert.equal(lookup.botanicalName, 'Oryza sativa');
  assert.equal(lookup.season, 'Kharif');
});

// Test 2: Government Scheme Eligibility Matching
test('Government Scheme Service matches eligible Indian schemes', async () => {
  const { INDIAN_GOVERNMENT_SCHEMES, matchFarmerSchemes } = await import('../src/lib/services/agriculture/schemeService.ts');
  assert.ok(INDIAN_GOVERNMENT_SCHEMES.length >= 5, 'At least 5 official schemes configured');

  const testFarm = {
    id: 'test-farm-1',
    ownerId: 'farmer-1',
    name: 'Sharma Organic Farm',
    location: { lat: 26.85, lng: 80.95, state: 'Uttar Pradesh', country: 'India' },
    areaHa: 2.5,
    crop: 'Wheat',
    cropStage: 'vegetative',
    irrigationType: 'drip',
    farmingPractice: 'regenerative',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const matched = matchFarmerSchemes(testFarm);
  assert.equal(matched.length, INDIAN_GOVERNMENT_SCHEMES.length);

  const pmKisan = matched.find(s => s.id === 'pm-kisan');
  assert.ok(pmKisan?.isEligible, 'Farmer is eligible for PM-KISAN');

  const pkvy = matched.find(s => s.id === 'pkvy');
  assert.ok(pkvy?.isEligible, 'Regenerative farmer is eligible for PKVY');
});

// Test 3: Soil Interpretation Heuristics
test('Soil Interpretation classifies pH, SOC, and Texture accurately', async () => {
  const { interpretSoil } = await import('../src/lib/soil/soilgrids.ts');

  const soilProfile = {
    ph: 7.8,
    organicCarbon: 0.45,
    sand: 30,
    silt: 40,
    clay: 30,
    bulkDensity: 1.35,
    source: 'soilgrids',
    fetchedAt: new Date().toISOString(),
    isDemo: false,
  };

  const interpretation = interpretSoil(soilProfile);
  assert.equal(interpretation.phStatus, 'slightly_alkaline');
  assert.equal(interpretation.socStatus, 'very_low');
  assert.equal(interpretation.overallHealth, 'poor');
});

// Test 4: Mandi Benchmark Pricing Integrity
test('Market Service provides verified benchmark pricing when API is offline', async () => {
  const { fetchMandiPrices } = await import('../src/lib/services/agriculture/marketService.ts');

  const market = await fetchMandiPrices('Wheat', 'Uttar Pradesh');
  assert.equal(market.crop, 'Wheat');
  assert.ok(market.averageModalPrice > 2000, 'Wheat modal price is above ₹2000/q');
  assert.ok(market.records.length > 0, 'Market records are populated');
  assert.equal(market.isDemo, true, 'Properly flagged as benchmark when API key is absent');
});

// Test 5: Predictive Modeling Contract Verification
test('Vertex AI Service returns valid prediction schema with provenance', async () => {
  const { predictYield } = await import('../src/lib/services/agriculture/vertexService.ts');

  const testFarm = {
    id: 'test-farm-2',
    ownerId: 'farmer-2',
    name: 'Verma Farm',
    location: { lat: 22.71, lng: 75.85, state: 'Madhya Pradesh', country: 'India' },
    areaHa: 4.0,
    crop: 'Soybean',
    cropStage: 'flowering',
    irrigationType: 'rainfed',
    farmingPractice: 'conventional',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prediction = await predictYield(testFarm);
  assert.equal(prediction.crop, 'Soybean');
  assert.ok(prediction.predictedYieldQuintalsPerHa > 0);
  assert.ok(prediction.confidenceInterval[0] <= prediction.predictedYieldQuintalsPerHa);
  assert.ok(prediction.confidenceInterval[1] >= prediction.predictedYieldQuintalsPerHa);
  assert.ok(prediction.provenance.modelType, 'Has defined modelType');
  assert.ok(prediction.provenance.trainingDataset, 'Has cited training dataset');
});
