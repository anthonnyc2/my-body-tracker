import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getBMICategory,
  calculateWHR,
  getWHRRisk,
  calculateSumOf6,
  calculateSomatotype,
  getBodyFatCategory,
  getMuscleMassCategory,
  getBoneMassCategory,
} from "@/lib/calculations"
import type { Gender } from "@prisma/client"
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import QRCode from "qrcode"
import { Image } from "@react-pdf/renderer"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Register fonts from Google Fonts (Vercel-compatible — no local file system needed)
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 10, padding: 40, color: "#111" },
  header: { marginBottom: 24, paddingBottom: 16, borderBottom: "1 solid #e5e7eb" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  card: { width: "48%", border: "1 solid #e5e7eb", borderRadius: 6, padding: 10, marginBottom: 6 },
  cardLabel: { fontSize: 8, color: "#6b7280", marginBottom: 2 },
  cardValue: { fontSize: 14, fontWeight: 700 },
  cardSub: { fontSize: 8, color: "#6b7280", marginTop: 1 },
  qrSection: { alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1 solid #e5e7eb" },
  qrLabel: { fontSize: 9, color: "#6b7280", marginBottom: 6 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#9ca3af" },
  recTitle: { fontSize: 9, fontWeight: 700, marginBottom: 3 },
  recText: { fontSize: 9, color: "#374151", lineHeight: 1.5, marginBottom: 8 },
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  // Verify auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { prisma } = await import("@/lib/prisma")
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      patient: { evaluatorId: user.id },
    },
    include: {
      patient: { include: { evaluator: true } },
      recommendation: true,
    },
  })

  if (!evaluation) {
    return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
  }

  const { patient } = evaluation
  const evaluatorName = `${patient.evaluator.firstName} ${patient.evaluator.lastName}`
  const shareUrl = `${request.nextUrl.origin}/share/${evaluation.shareToken}`

  // Gender cast for category functions
  const genderForCategories: "MALE" | "FEMALE" =
    patient.gender === "MALE" ? "MALE" : "FEMALE"

  const bmiCategory = evaluation.bmi ? getBMICategory(evaluation.bmi) : null
  const bodyFatCat = evaluation.bodyFatPct
    ? getBodyFatCategory(evaluation.bodyFatPct, genderForCategories)
    : null
  const muscleMassPct = evaluation.muscleMassKg
    ? (evaluation.muscleMassKg / evaluation.weight) * 100
    : null
  const muscleMassCat = muscleMassPct
    ? getMuscleMassCategory(muscleMassPct, genderForCategories)
    : null
  const boneMassPct = evaluation.boneMassKg
    ? (evaluation.boneMassKg / evaluation.weight) * 100
    : null
  const boneMassCat = boneMassPct
    ? getBoneMassCategory(boneMassPct, genderForCategories)
    : null

  const whr = calculateWHR(evaluation.girthWaist ?? 0, evaluation.girthHip ?? 0)
  const whrRisk = whr ? getWHRRisk(whr, patient.gender as Gender) : null

  const measurements = {
    gender: patient.gender as Gender,
    age: evaluation.decimalAge ?? 25,
    weight: evaluation.weight,
    height: evaluation.height,
    girthRelaxedArm: evaluation.girthRelaxedArm ?? undefined,
    girthFlexedArm: evaluation.girthFlexedArm ?? undefined,
    girthForearm: evaluation.girthForearm ?? undefined,
    girthWaist: evaluation.girthWaist ?? undefined,
    girthHip: evaluation.girthHip ?? undefined,
    girthThigh: evaluation.girthThigh ?? undefined,
    girthCalf: evaluation.girthCalf ?? undefined,
    breadthHumerus: evaluation.breadthHumerus ?? undefined,
    breadthFemur: evaluation.breadthFemur ?? undefined,
    breadthBistyl: evaluation.breadthBistyl ?? undefined,
    breadthBimal: evaluation.breadthBimal ?? undefined,
    skinfoldTriceps: evaluation.skinfoldTriceps ?? undefined,
    skinfoldSubscap: evaluation.skinfoldSubscap ?? undefined,
    skinfoldBiceps: evaluation.skinfoldBiceps ?? undefined,
    skinfoldIliac: evaluation.skinfoldIliac ?? undefined,
    skinfoldSuprasp: evaluation.skinfoldSuprasp ?? undefined,
    skinfoldAbdom: evaluation.skinfoldAbdom ?? undefined,
    skinfoldThigh: evaluation.skinfoldThigh ?? undefined,
    skinfoldCalf: evaluation.skinfoldCalf ?? undefined,
  }

  const sumOf6 = calculateSumOf6(measurements)
  const somatotype = calculateSomatotype(measurements)

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(shareUrl, { width: 120, margin: 1 })

  const evalDate = format(
    new Date(
      new Date(evaluation.date).getUTCFullYear(),
      new Date(evaluation.date).getUTCMonth(),
      new Date(evaluation.date).getUTCDate()
    ),
    "dd MMMM yyyy",
    { locale: es }
  )

  const fmt = (v: number | null | undefined, dec = 1) =>
    v != null ? v.toFixed(dec) : "—"

  const genderLabel = patient.gender === "MALE" ? "Masculino" : patient.gender === "FEMALE" ? "Femenino" : "Otro"
  const ageYears = evaluation.decimalAge ? Math.floor(evaluation.decimalAge) : "—"

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{patient.firstName} {patient.lastName}</Text>
          <Text style={styles.subtitle}>
            Fecha: {evalDate} · Edad: {ageYears} años · Sexo: {genderLabel}
          </Text>
          <Text style={styles.subtitle}>Evaluador: {evaluatorName}</Text>
        </View>

        {/* Body Composition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Composición Corporal</Text>
          <View style={styles.grid}>
            <MetricCard label="Peso" value={`${fmt(evaluation.weight)} kg`} />
            <MetricCard label="Talla" value={`${fmt(evaluation.height, 0)} cm`} />
            <MetricCard
              label="Masa Adiposa"
              value={`${fmt(evaluation.bodyFatKg)} kg`}
              sub={evaluation.bodyFatPct ? `${fmt(evaluation.bodyFatPct)}%${bodyFatCat ? ` · ${bodyFatCat.category}` : ""}` : undefined}
            />
            <MetricCard
              label="Masa Muscular"
              value={`${fmt(evaluation.muscleMassKg)} kg`}
              sub={muscleMassPct ? `${fmt(muscleMassPct)}%${muscleMassCat ? ` · ${muscleMassCat.category}` : ""}` : undefined}
            />
            <MetricCard
              label="Masa Ósea"
              value={`${fmt(evaluation.boneMassKg)} kg`}
              sub={boneMassCat?.category}
            />
            <MetricCard label="Masa Residual" value={`${fmt(evaluation.residualMassKg)} kg`} />
          </View>
        </View>

        {/* Advanced indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores Avanzados</Text>
          <View style={styles.grid}>
            <MetricCard
              label="IMC"
              value={fmt(evaluation.bmi)}
              sub={bmiCategory?.category}
            />
            <MetricCard
              label="Sumatoria 6 Pliegues"
              value={sumOf6 ? `${fmt(sumOf6)} mm` : "—"}
            />
            <MetricCard
              label="Índice Cintura-Cadera"
              value={whr ? whr.toFixed(2) : "—"}
              sub={whrRisk ? `Riesgo: ${whrRisk.risk}` : undefined}
            />
            <MetricCard
              label="Peso Ideal Sugerido"
              value={evaluation.idealWeight ? `${fmt(evaluation.idealWeight)} kg` : "—"}
            />
            <MetricCard
              label="Somatotipo"
              value={somatotype?.classification ?? "—"}
              sub={
                somatotype
                  ? `${somatotype.endomorphy.toFixed(1)} · ${somatotype.mesomorphy.toFixed(1)} · ${somatotype.ectomorphy.toFixed(1)}`
                  : undefined
              }
            />
          </View>
        </View>

        {/* QR code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>Accedé a tu reporte online</Text>
          <Image src={qrDataUrl} style={{ width: 80, height: 80 }} />
        </View>

        <Text style={styles.footer}>Generado con Body Tracker</Text>
      </Page>

      {/* Page 2: Recommendation (only if present) */}
      {evaluation.recommendation && (
        evaluation.recommendation.observations ||
        evaluation.recommendation.conclusions ||
        evaluation.recommendation.recommendations
      ) ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={{ ...styles.sectionTitle, marginBottom: 16 }}>
              Informe del Evaluador
            </Text>
            {evaluation.recommendation?.observations && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.recTitle}>Observaciones</Text>
                <Text style={styles.recText}>{evaluation.recommendation.observations}</Text>
              </View>
            )}
            {evaluation.recommendation?.conclusions && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.recTitle}>Conclusiones</Text>
                <Text style={styles.recText}>{evaluation.recommendation.conclusions}</Text>
              </View>
            )}
            {evaluation.recommendation?.recommendations && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.recTitle}>Recomendaciones</Text>
                <Text style={styles.recText}>{evaluation.recommendation.recommendations}</Text>
              </View>
            )}
          </View>
          <Text style={styles.footer}>Generado con Body Tracker</Text>
        </Page>
      ) : null}
    </Document>
  )

  const buffer = await renderToBuffer(doc)

  const patientName = `${patient.firstName}-${patient.lastName}`.replace(/\s+/g, "-")
  const filename = `evaluacion-${patientName}-${evaluation.date.toISOString().slice(0, 10)}.pdf`

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

// PDF sub-component
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  )
}
