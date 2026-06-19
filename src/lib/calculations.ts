import type { Gender } from "@prisma/client"

export interface Measurements {
  gender: Gender
  age: number
  weight: number
  height: number // in cm
  
  // Skinfolds (mm)
  skinfoldTriceps?: number
  skinfoldSubscap?: number
  skinfoldBiceps?: number
  skinfoldIliac?: number
  skinfoldSuprasp?: number
  skinfoldAbdom?: number
  skinfoldThigh?: number
  skinfoldCalf?: number

  // Girths (cm)
  girthRelaxedArm?: number
  girthFlexedArm?: number
  girthForearm?: number
  girthWaist?: number
  girthHip?: number
  girthThigh?: number
  girthCalf?: number

  // Breadths (cm)
  breadthHumerus?: number
  breadthFemur?: number
  breadthBistyl?: number
  breadthBimal?: number
}

// === Basic Calculations ===

export function calculateBMI(weight: number, heightCm: number): number {
  if (heightCm === 0) return 0
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

// === Body Fat Formulas ===

// Yuhasz (6 skinfolds: Triceps, Subscapular, Supraspinal, Abdominal, Thigh, Calf)
export function calculateFatYuhasz(m: Measurements): number | null {
  const { skinfoldTriceps, skinfoldSubscap, skinfoldSuprasp, skinfoldAbdom, skinfoldThigh, skinfoldCalf, gender } = m
  if (!skinfoldTriceps || !skinfoldSubscap || !skinfoldSuprasp || !skinfoldAbdom || !skinfoldThigh || !skinfoldCalf) return null

  const sum6 = skinfoldTriceps + skinfoldSubscap + skinfoldSuprasp + skinfoldAbdom + skinfoldThigh + skinfoldCalf
  
  if (gender === "MALE") {
    return (sum6 * 0.1051) + 2.585
  } else {
    return (sum6 * 0.1548) + 3.58
  }
}

// Jackson-Pollock (7 skinfolds for more accuracy, or 3)
// We'll implement 7-site: Chest, Axilla, Triceps, Subscapular, Abdomen, Suprailiac, Thigh
// Since we use ISAK standard, we might not have chest/axilla. 
// Let's implement Faulkner (4 skinfolds: Triceps, Subscapular, Supraspinal, Abdominal)
export function calculateFatFaulkner(m: Measurements): number | null {
  const { skinfoldTriceps, skinfoldSubscap, skinfoldSuprasp, skinfoldIliac, skinfoldAbdom, gender } = m
  const supra = skinfoldSuprasp || skinfoldIliac
  if (!skinfoldTriceps || !skinfoldSubscap || !supra || !skinfoldAbdom) return null

  const sum4 = skinfoldTriceps + skinfoldSubscap + supra + skinfoldAbdom
  
  if (gender === "MALE") {
    return (sum4 * 0.153) + 5.783
  } else {
    return (sum4 * 0.213) + 7.9
  }
}

// Durnin-Womersley (4 skinfolds: Biceps, Triceps, Subscapular, Suprailiac)
export function calculateFatDurninWomersley(m: Measurements): number | null {
  const { skinfoldBiceps, skinfoldTriceps, skinfoldSubscap, skinfoldIliac, gender, age } = m
  if (!skinfoldBiceps || !skinfoldTriceps || !skinfoldSubscap || !skinfoldIliac) return null

  const sum4 = skinfoldBiceps + skinfoldTriceps + skinfoldSubscap + skinfoldIliac
  const logSum = Math.log10(sum4)
  
  let density = 0
  if (gender === "MALE") {
    if (age < 17) density = 1.1533 - (0.0643 * logSum)
    else if (age <= 19) density = 1.1620 - (0.0630 * logSum)
    else if (age <= 29) density = 1.1631 - (0.0632 * logSum)
    else if (age <= 39) density = 1.1422 - (0.0544 * logSum)
    else if (age <= 49) density = 1.1620 - (0.0700 * logSum)
    else density = 1.1715 - (0.0779 * logSum)
  } else {
    if (age < 17) density = 1.1369 - (0.0598 * logSum)
    else if (age <= 19) density = 1.1549 - (0.0678 * logSum)
    else if (age <= 29) density = 1.1599 - (0.0717 * logSum)
    else if (age <= 39) density = 1.1423 - (0.0632 * logSum)
    else if (age <= 49) density = 1.1333 - (0.0612 * logSum)
    else density = 1.1339 - (0.0645 * logSum)
  }

  // Siri equation to convert density to % fat
  if (density === 0) return null
  return (495 / density) - 450
}


// === Muscle Mass Formulas ===

// Lee (Muscle Mass in Kg)
export function calculateMuscleMassLee(m: Measurements): number | null {
  const { height, girthRelaxedArm, girthThigh, girthCalf, skinfoldTriceps, skinfoldThigh, skinfoldCalf, gender, age } = m
  if (!girthRelaxedArm || !girthThigh || !girthCalf || !skinfoldTriceps || !skinfoldThigh || !skinfoldCalf) return null

  // Corrected girths (cm)
  const cArm = girthRelaxedArm - (Math.PI * (skinfoldTriceps / 10))
  const cThigh = girthThigh - (Math.PI * (skinfoldThigh / 10))
  const cCalf = girthCalf - (Math.PI * (skinfoldCalf / 10))

  const heightM = height / 100

  // Lee Equation
  const genderFactor = gender === "MALE" ? 1 : 0
  const muscleMassKg = heightM * (0.00744 * (cArm ** 2) + 0.00088 * (cThigh ** 2) + 0.00441 * (cCalf ** 2)) + 2.4 * genderFactor - 0.048 * age + 7.8

  return muscleMassKg
}

// === Bone and Residual Mass Formulas ===

// Von Dobeln modified by Rocha (Bone Mass in Kg)
export function calculateBoneMassRocha(m: Measurements): number | null {
  const { height, breadthBistyl, breadthFemur } = m
  if (!height || !breadthBistyl || !breadthFemur) return null

  const hM = height / 100
  const bistylM = breadthBistyl / 100
  const femurM = breadthFemur / 100

  const inner = (hM * hM) * bistylM * femurM * 400
  return 3.02 * Math.pow(inner, 0.712)
}

// Wurch (Residual Mass in Kg)
export function calculateResidualMassWurch(m: Measurements): number | null {
  const { weight, gender } = m
  if (!weight) return null
  return gender === "MALE" ? weight * 0.241 : weight * 0.209
}

// === 4-Component Model Normalization ===

export interface FourComponentModel {
  fatMassKg: number
  muscleMassKg: number
  boneMassKg: number
  residualMassKg: number
  sumBeforeNormalization: number
}

export function calculate4ComponentFractionation(m: Measurements): FourComponentModel | null {
  // 1. Fat Mass
  let fatPct = calculateFatYuhasz(m)
  if (fatPct === null) {
    fatPct = calculateFatFaulkner(m)
  }
  const fatMassKg = fatPct !== null ? (fatPct / 100) * m.weight : null

  // 2. Muscle Mass (Lee)
  const muscleMassKg = calculateMuscleMassLee(m)

  // 3. Bone Mass (Rocha)
  const boneMassKg = calculateBoneMassRocha(m)

  // 4. Residual Mass (Wurch)
  const residualMassKg = calculateResidualMassWurch(m)

  if (fatMassKg === null || muscleMassKg === null || boneMassKg === null || residualMassKg === null) {
    return null // Not enough data for the full model
  }

  const sum = fatMassKg + muscleMassKg + boneMassKg + residualMassKg
  
  // Normalize proportionally so they sum EXACTLY to the scale weight
  const factor = m.weight / sum
  
  return {
    fatMassKg: fatMassKg * factor,
    muscleMassKg: muscleMassKg * factor,
    boneMassKg: boneMassKg * factor,
    residualMassKg: residualMassKg * factor,
    sumBeforeNormalization: sum
  }
}

// === Advanced Metrics ===

export function getBMICategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: "Bajo peso", color: "text-blue-600" }
  if (bmi < 25) return { category: "Normopeso", color: "text-green-600" }
  if (bmi < 30) return { category: "Sobrepeso", color: "text-yellow-600" }
  if (bmi < 35) return { category: "Obesidad Grado I", color: "text-orange-600" }
  if (bmi < 40) return { category: "Obesidad Grado II", color: "text-red-600" }
  return { category: "Obesidad Grado III", color: "text-red-800" }
}

export function calculateWHR(waist: number, hip: number): number | null {
  if (!waist || !hip) return null
  return waist / hip
}

export function getWHRRisk(whr: number, gender: Gender): { risk: string; color: string } {
  if (gender === "MALE") {
    if (whr < 0.90) return { risk: "Bajo", color: "text-green-600" }
    if (whr < 0.95) return { risk: "Moderado", color: "text-yellow-600" }
    return { risk: "Alto", color: "text-red-600" }
  } else {
    // FEMALE & OTHER
    if (whr < 0.80) return { risk: "Bajo", color: "text-green-600" }
    if (whr < 0.85) return { risk: "Moderado", color: "text-yellow-600" }
    return { risk: "Alto", color: "text-red-600" }
  }
}

export function calculateSumOf6(m: Measurements): number | null {
  const { skinfoldTriceps, skinfoldSubscap, skinfoldSuprasp, skinfoldIliac, skinfoldAbdom, skinfoldThigh, skinfoldCalf } = m
  const supra = skinfoldSuprasp || skinfoldIliac
  if (!skinfoldTriceps || !skinfoldSubscap || !supra || !skinfoldAbdom || !skinfoldThigh || !skinfoldCalf) return null

  return skinfoldTriceps + skinfoldSubscap + supra + skinfoldAbdom + skinfoldThigh + skinfoldCalf
}

export function calculateIdealWeight(fatFreeMass: number | null, gender: Gender): number | null {
  if (!fatFreeMass) return null
  const targetFatPct = gender === "MALE" ? 0.15 : 0.22
  return fatFreeMass / (1 - targetFatPct)
}

export function calculateSomatotype(m: Measurements): { endomorphy: number, mesomorphy: number, ectomorphy: number, classification: string } | null {
  const { 
    height, weight, 
    skinfoldTriceps, skinfoldSubscap, skinfoldSuprasp, skinfoldIliac, skinfoldCalf,
    breadthHumerus, breadthFemur,
    girthFlexedArm, girthCalf
  } = m

  const supra = skinfoldSuprasp || skinfoldIliac
  
  if (!height || !weight || !skinfoldTriceps || !skinfoldSubscap || !supra || !skinfoldCalf || !breadthHumerus || !breadthFemur || !girthFlexedArm || !girthCalf) {
    return null
  }
  // Endomorphy
  const sum3 = (skinfoldTriceps + skinfoldSubscap + supra) * (170.18 / height)
  const endomorphy = -0.7182 + 0.1451 * sum3 - 0.00068 * Math.pow(sum3, 2) + 0.0000014 * Math.pow(sum3, 3)

  // Mesomorphy
  const correctedArmGirth = girthFlexedArm - (skinfoldTriceps / 10)
  const correctedCalfGirth = girthCalf - (skinfoldCalf / 10)
  const mesomorphy = (0.858 * breadthHumerus) + (0.601 * breadthFemur) + (0.188 * correctedArmGirth) + (0.161 * correctedCalfGirth) - (0.131 * height) + 4.5

  // Ectomorphy
  const hwr = height / Math.pow(weight, 1/3)
  let ectomorphy = 0.1
  if (hwr >= 40.75) {
    ectomorphy = 0.732 * hwr - 28.58
  } else if (hwr > 38.25 && hwr < 40.75) {
    ectomorphy = 0.463 * hwr - 17.63
  }

  // Classification logic
  let classification = "Central"
  const endo = endomorphy
  const meso = mesomorphy
  const ecto = ectomorphy

  if (endo >= meso && endo >= ecto) {
    if (meso > ecto) classification = "Endo-Mesomorfo"
    else if (ecto > meso) classification = "Endo-Ectomorfo"
    else classification = "Endomorfo Balanceado"
  } else if (meso >= endo && meso >= ecto) {
    if (endo > ecto) classification = "Meso-Endomorfo"
    else if (ecto > endo) classification = "Meso-Ectomorfo"
    else classification = "Mesomorfo Balanceado"
  } else if (ecto >= endo && ecto >= meso) {
    if (endo > meso) classification = "Ecto-Endomorfo"
    else if (meso > endo) classification = "Ecto-Mesomorfo"
    else classification = "Ectomorfo Balanceado"
  }

  return {
    endomorphy: Math.max(0.1, Number(endomorphy.toFixed(1))),
    mesomorphy: Math.max(0.1, Number(mesomorphy.toFixed(1))),
    ectomorphy: Math.max(0.1, Number(ectomorphy.toFixed(1))),
    classification
  }
}

// === Categories for Body Composition ===

export function getBodyFatCategory(pct: number, gender: "MALE" | "FEMALE"): { category: string, color: string } {
  if (gender === "MALE") {
    if (pct < 8) return { category: "Bajo (Atleta)", color: "text-blue-500" }
    if (pct <= 15) return { category: "Óptimo (Fitness)", color: "text-green-500" }
    if (pct <= 24) return { category: "Normal (Promedio)", color: "text-yellow-500" }
    return { category: "Alto (Exceso)", color: "text-red-500" }
  } else {
    if (pct < 15) return { category: "Bajo (Atleta)", color: "text-blue-500" }
    if (pct <= 23) return { category: "Óptimo (Fitness)", color: "text-green-500" }
    if (pct <= 31) return { category: "Normal (Promedio)", color: "text-yellow-500" }
    return { category: "Alto (Exceso)", color: "text-red-500" }
  }
}

export function getMuscleMassCategory(pct: number, gender: "MALE" | "FEMALE"): { category: string, color: string } {
  if (gender === "MALE") {
    if (pct < 40) return { category: "Bajo", color: "text-red-500" }
    if (pct <= 50) return { category: "Normal", color: "text-green-500" }
    return { category: "Alto (Atlético)", color: "text-blue-500" }
  } else {
    if (pct < 30) return { category: "Bajo", color: "text-red-500" }
    if (pct <= 40) return { category: "Normal", color: "text-green-500" }
    return { category: "Alto (Atlético)", color: "text-blue-500" }
  }
}

export function getBoneMassCategory(pct: number, gender: "MALE" | "FEMALE"): { category: string, color: string } {
  if (gender === "MALE") {
    if (pct < 11) return { category: "Baja Densidad", color: "text-yellow-500" }
    if (pct <= 15) return { category: "Normal", color: "text-green-500" }
    return { category: "Estructura Pesada", color: "text-blue-500" }
  } else {
    if (pct < 9) return { category: "Baja Densidad", color: "text-yellow-500" }
    if (pct <= 14) return { category: "Normal", color: "text-green-500" }
    return { category: "Estructura Pesada", color: "text-blue-500" }
  }
}

export function calculateGoalProjections(
  weight: number,
  bodyFatKg: number,
  muscleMassKg: number,
  gender: "MALE" | "FEMALE" | "OTHER",
  customTargetFatPct?: number | null,
  customTargetMusclePct?: number | null
): { fatToLose: number; muscleToGain: number; targetWeight: number; isCustom: boolean } | null {
  if (!weight || !bodyFatKg || !muscleMassKg) return null

  // 1. Target Percentages (convert from 0-100 to 0-1 if custom are provided, else use defaults)
  let isCustom = false
  let targetFatPct = gender === "MALE" ? 0.15 : 0.22
  let targetMusclePct = gender === "MALE" ? 0.45 : 0.35

  if (customTargetFatPct) {
    targetFatPct = customTargetFatPct / 100
    isCustom = true
  }
  if (customTargetMusclePct) {
    targetMusclePct = customTargetMusclePct / 100
    isCustom = true
  }

  const currentFatPct = bodyFatKg / weight
  const currentMusclePct = muscleMassKg / weight

  // Current FFM (Fat-Free Mass)
  const currentFFM = weight - bodyFatKg

  // 2. Target Ideal Weight based on current FFM and Target Fat %
  const targetWeight = currentFFM / (1 - targetFatPct)

  // 3. Fat to Lose
  const idealFatKg = targetWeight * targetFatPct
  // If they are already leaner than target, no fat to lose
  const fatToLose = currentFatPct > targetFatPct ? bodyFatKg - idealFatKg : 0

  // 4. Muscle to Gain
  const idealMuscleKg = targetWeight * targetMusclePct
  // If they already have more muscle than target %, no muscle to gain
  const muscleToGain = currentMusclePct < targetMusclePct ? idealMuscleKg - muscleMassKg : 0

  return {
    fatToLose: Number(fatToLose.toFixed(1)),
    muscleToGain: Number(muscleToGain.toFixed(1)),
    targetWeight: Number(targetWeight.toFixed(1)),
    isCustom
  }
}
