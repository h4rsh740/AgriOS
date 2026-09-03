// ============================================================
// AgriOS — Firestore Database Service
// All farm data operations
// ============================================================
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './client';
import { Farm, SoilProfile, WeatherData, SatelliteSnapshot, DiseaseAssessment, AIRecommendation, RegenerativeScore, SimulationComparison, RegenerativeRoadmap, FarmAlert } from '@/types';
import type { Firestore } from 'firebase/firestore';

function requireDb(): Firestore {
  if (!db) throw new Error('Firestore is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars to .env.local.');
  return db;
}

// ---- Farms ----

export async function createFarm(userId: string, farmData: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(requireDb(), 'farms'), {
    ...farmData,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getFarm(farmId: string): Promise<Farm | null> {
  const snap = await getDoc(doc(requireDb(), 'farms', farmId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Farm;
}

export async function getUserFarms(userId: string): Promise<Farm[]> {
  const q = query(collection(requireDb(), 'farms'), where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Farm));
}

export async function updateFarm(farmId: string, updates: Partial<Farm>) {
  await updateDoc(doc(requireDb(), 'farms', farmId), { ...updates, updatedAt: serverTimestamp() });
}

// ---- Soil Profiles ----

export async function saveSoilProfile(farmId: string, soil: Omit<SoilProfile, never>) {
  const ref = doc(requireDb(), 'soil_profiles', farmId);
  await setDoc(ref, { ...soil, farmId, savedAt: serverTimestamp() }, { merge: true });
}

export async function getSoilProfile(farmId: string): Promise<SoilProfile | null> {
  const snap = await getDoc(doc(requireDb(), 'soil_profiles', farmId));
  if (!snap.exists()) return null;
  return snap.data() as SoilProfile;
}

// ---- Weather ----

export async function saveWeatherSnapshot(farmId: string, weather: WeatherData) {
  const ref = doc(requireDb(), 'weather_observations', farmId);
  await setDoc(ref, { ...weather, farmId, savedAt: serverTimestamp() }, { merge: true });
}

export async function getLatestWeather(farmId: string): Promise<WeatherData | null> {
  const snap = await getDoc(doc(requireDb(), 'weather_observations', farmId));
  if (!snap.exists()) return null;
  return snap.data() as WeatherData;
}

// ---- Satellite ----

export async function saveSatelliteSnapshot(farmId: string, sat: SatelliteSnapshot) {
  const ref = doc(collection(requireDb(), 'satellite_observations'));
  await setDoc(ref, { ...sat, savedAt: serverTimestamp() });
}

export async function getLatestSatellite(farmId: string): Promise<SatelliteSnapshot | null> {
  const q = query(
    collection(requireDb(), 'satellite_observations'),
    where('farmId', '==', farmId),
    orderBy('date', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as SatelliteSnapshot;
}

// ---- Disease Cases ----

export async function saveDiseaseAssessment(assessment: DiseaseAssessment) {
  const ref = doc(collection(requireDb(), 'disease_cases'));
  await setDoc(ref, { ...assessment, savedAt: serverTimestamp() });
  return ref.id;
}

export async function getFarmDiseaseHistory(farmId: string): Promise<DiseaseAssessment[]> {
  const q = query(
    collection(requireDb(), 'disease_cases'),
    where('farmId', '==', farmId),
    orderBy('assessedAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as DiseaseAssessment);
}

// ---- Recommendations ----

export async function saveRecommendation(rec: AIRecommendation & { farmId: string }) {
  const ref = doc(collection(requireDb(), 'recommendations'));
  await setDoc(ref, { ...rec, savedAt: serverTimestamp() });
  return ref.id;
}

export async function getLatestRecommendation(farmId: string): Promise<AIRecommendation | null> {
  const q = query(
    collection(requireDb(), 'recommendations'),
    where('farmId', '==', farmId),
    orderBy('generatedAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as AIRecommendation;
}

// ---- Regenerative Scores ----

export async function saveRegenerativeScore(farmId: string, score: RegenerativeScore) {
  const ref = doc(requireDb(), 'regenerative_scores', farmId);
  await setDoc(ref, { ...score, farmId, savedAt: serverTimestamp() }, { merge: true });
}

export async function getRegenerativeScore(farmId: string): Promise<RegenerativeScore | null> {
  const snap = await getDoc(doc(requireDb(), 'regenerative_scores', farmId));
  if (!snap.exists()) return null;
  return snap.data() as RegenerativeScore;
}

// ---- Simulations ----

export async function saveSimulation(farmId: string, sim: SimulationComparison) {
  const ref = doc(collection(requireDb(), 'simulations'));
  await setDoc(ref, { ...sim, farmId, savedAt: serverTimestamp() });
  return ref.id;
}

// ---- Roadmaps ----

export async function saveRoadmap(farmId: string, roadmap: RegenerativeRoadmap) {
  const ref = doc(requireDb(), 'roadmaps', farmId);
  await setDoc(ref, { ...roadmap, farmId, savedAt: serverTimestamp() }, { merge: true });
}

export async function getRoadmap(farmId: string): Promise<RegenerativeRoadmap | null> {
  const snap = await getDoc(doc(requireDb(), 'roadmaps', farmId));
  if (!snap.exists()) return null;
  return snap.data() as RegenerativeRoadmap;
}

// ---- Alerts ----

export async function getFarmAlerts(farmId: string): Promise<FarmAlert[]> {
  const q = query(
    collection(requireDb(), 'alerts'),
    where('farmId', '==', farmId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FarmAlert));
}
