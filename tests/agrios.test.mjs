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

// Test 6: Sensor Contradiction & Dispute Detection Logic
test('Multi-Agent Orchestrator detects conflicting sensor telemetry', async () => {
  const { detectSensorContradictions } = await import('../src/lib/ai/contradictionDetector.ts');

  // Construct a context where upcoming rainfall conflicts with active drip irrigation schedule
  const contradictoryContext = {
    farm: {
      id: 'test-farm-conflict',
      ownerId: 'farmer-1',
      name: 'Conflict Test Farm',
      location: { lat: 26.85, lng: 80.95, state: 'Uttar Pradesh', country: 'India' },
      areaHa: 2.0,
      crop: 'Wheat',
      cropStage: 'vegetative',
      irrigationType: 'drip',
      farmingPractice: 'conventional',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    weather: {
      current: { temperature: 38, humidity: 72, windSpeed: 5, description: 'Partly cloudy' },
      forecast: [
        { date: '2026-09-06', minTemp: 24, maxTemp: 34, precipitation: 15.0, description: 'Heavy rain' },
        { date: '2026-09-07', minTemp: 22, maxTemp: 32, precipitation: 10.0, description: 'Moderate rain' },
      ],
      risks: { heatStress: 'high', frostRisk: 'low', diseaseRisk: 'high', irrigationStress: 'low' },
      source: 'Open-Meteo',
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    },
    soil: {
      ph: 8.3,
      organicCarbon: 0.35,
      sand: 30, silt: 40, clay: 30,
      bulkDensity: 1.4,
      source: 'soilgrids',
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    },
    satellite: {
      ndvi: 0.72,
      trend: 'improving',
      trendValue: 0.05,
      status: 'healthy_vegetation',
      source: 'sentinel-2',
      capturedAt: new Date().toISOString(),
      isDemo: false,
    },
  };

  const contradictions = detectSensorContradictions(contradictoryContext);
  assert.ok(contradictions.length >= 2, 'Detects multiple sensor contradictions');

  // Verify precipitation vs irrigation contradiction
  const rainConflict = contradictions.find(c => c.sourceA.includes('Precipitation'));
  assert.ok(rainConflict, 'Detects precipitation vs irrigation conflict');
  assert.equal(rainConflict.severity, 'high');

  // Verify high NDVI vs depleted soil organic carbon
  const soilConflict = contradictions.find(c => c.sourceB.includes('SoilGrids'));
  assert.ok(soilConflict, 'Detects high canopy vigor vs depleted soil organic matter');
});

// Test 7: ICAR Agro-Climatic Zoning & FAOSTAT Benchmarks
test('Geospatial Service resolves ICAR agro-climatic zones and FAOSTAT benchmarks', async () => {
  const { getAgroClimaticZone, getFAOSTATBenchmark } = await import('../src/lib/services/agriculture/geospatialService.ts');

  // Test ICAR zone resolution for Uttar Pradesh
  const upZone = getAgroClimaticZone('Uttar Pradesh');
  assert.equal(upZone.zoneNumber, 5);
  assert.equal(upZone.zoneName, 'Upper Gangetic Plains Region');
  assert.ok(upZone.primaryCrops.includes('Wheat'));
  assert.ok(upZone.isroBhuvanTheme.includes('Bhuvan'));

  // Test FAOSTAT benchmark for Wheat
  const wheatFao = getFAOSTATBenchmark('Wheat');
  assert.equal(wheatFao.crop, 'Wheat');
  assert.ok(wheatFao.globalAverageYieldQHa > 30);
  assert.ok(wheatFao.potentialYieldGapPercent > 0);
  assert.equal(wheatFao.reportingYear, 2025);
});


