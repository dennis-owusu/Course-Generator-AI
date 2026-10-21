import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'

/* ------------------------------------------------------------------
   NursingAnalytics — context-specific dashboards for a nursing college.
   - Student enrollment trends (vertical bar chart)
   - Clinical rotation schedule (timeline / Gantt-style bars)
   - Faculty workload (horizontal bar chart)
   - Resource utilization (donut chart)
   All charts are built with accessible inline SVG, no external chart lib.
   Color palette: teal primary, sage/lavender/warm accents.
   Text/background combinations verified for WCAG 2.1 AA.
   ------------------------------------------------------------------ */

const COLORS = {
  teal: '#0f766e',      // teal-700 — primary
  tealLight: '#5eead4', // teal-300
  sage: '#4d6b43',      // sage-600
  sageLight: '#cadbc3', // sage-200
  lavender: '#6f5fa8',  // lavender-600
  lavenderLight: '#ddd9f0',
  warm: '#8a7c6a',      // warm-600
  warmLight: '#e4e0d8',
  text: '#0f172a',
  muted: '#57534e',
  grid: '#e7e5e4',
}

// Simple responsive SVG helper
function useSvgWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    if (!ref.current) return
    const update = () => {
      const w = ref.current.getBoundingClientRect().width
      setWidth(w || 600)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(ref.current)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return { ref, width }
}

function KpiCard({ icon: Icon, label, value, subtext, colorClass }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-teal-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-warm-700">{label}</p>
        <p className="text-2xl font-bold text-teal-900">{value}</p>
        <p className="text-xs text-warm-700">{subtext}</p>
      </div>
    </div>
  )
}

function EnrollmentChart() {
  const data = useMemo(
    () => [
      { label: 'First Year', value: 124, capacity: 150 },
      { label: 'Second Year', value: 112, capacity: 140 },
      { label: 'Third Year', value: 98, capacity: 120 },
      { label: 'Fourth Year', value: 86, capacity: 100 },
    ],
    []
  )
  const { ref, width } = useSvgWidth()
  const height = 260
  const margin = { top: 20, right: 16, bottom: 48, left: 40 }
  const innerWidth = Math.max(width - margin.left - margin.right, 100)
  const innerHeight = height - margin.top - margin.bottom
  const max = Math.max(...data.map((d) => d.capacity))
  const band = innerWidth / data.length
  const barW = band * 0.45
  const gap = band * 0.12

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label="Student enrollment by academic year">
        <title>Student enrollment by academic year</title>
        <desc>
          {data
            .map((d) => `${d.label}: ${d.value} enrolled, capacity ${d.capacity}`)
            .join('; ')}
        </desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = innerHeight - (i * innerHeight) / 4
            return (
              <line
                key={i}
                x1={0}
                x2={innerWidth}
                y1={y}
                y2={y}
                stroke={COLORS.grid}
                strokeDasharray="3 3"
              />
            )
          })}
          {/* bars */}
          {data.map((d, i) => {
            const x = i * band + band / 2
            const h = (d.value / max) * innerHeight
            const capH = (d.capacity / max) * innerHeight
            return (
              <g key={d.label}>
                <rect
                  x={x - barW / 2 - gap / 2}
                  y={innerHeight - capH}
                  width={barW}
                  height={capH}
                  fill={COLORS.warmLight}
                  rx={4}
                />
                <rect
                  x={x - barW / 2 - gap / 2}
                  y={innerHeight - h}
                  width={barW}
                  height={h}
                  fill={COLORS.teal}
                  rx={4}
                />
                <text
                  x={x}
                  y={innerHeight - h - 6}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill={COLORS.text}
                >
                  {d.value}
                </text>
                <text
                  x={x}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  fontSize={12}
                  fill={COLORS.muted}
                >
                  {d.label}
                </text>
              </g>
            )
          })}
          {/* y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = innerHeight - (i * innerHeight) / 4
            return (
              <text key={i} x={-8} y={y + 4} textAnchor="end" fontSize={11} fill={COLORS.muted}>
                {Math.round((i * max) / 4)}
              </text>
            )
          })}
        </g>
      </svg>
      <div className="flex flex-wrap gap-4 text-xs mt-2">
        <span className="flex items-center gap-1.5 text-warm-800">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.teal }}></span> Enrolled
        </span>
        <span className="flex items-center gap-1.5 text-warm-800">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.warmLight }}></span> Capacity
        </span>
      </div>
    </div>
  )
}

function RotationSchedule() {
  const wards = useMemo(
    () => [
      { name: 'Medical-Surgical', students: 28, start: 1, duration: 5 },
      { name: 'Pediatrics', students: 20, start: 3, duration: 4 },
      { name: 'Obstetrics / Gynecology', students: 24, start: 5, duration: 5 },
      { name: 'Mental Health', students: 16, start: 8, duration: 3 },
      { name: 'Community Health', students: 22, start: 10, duration: 4 },
      { name: 'Critical Care', students: 14, start: 12, duration: 4 },
    ],
    []
  )
  const weeks = 12
  const { ref, width } = useSvgWidth()
  const height = 280
  const margin = { top: 8, right: 16, bottom: 40, left: 168 }
  const innerWidth = Math.max(width - margin.left - margin.right, 100)
  const innerHeight = height - margin.top - margin.bottom
  const rowH = innerHeight / wards.length
  const colW = innerWidth / weeks

  const weekLabels = ['Wk 1', 'Wk 4', 'Wk 8', 'Wk 12']

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label="Clinical rotation schedule over 12 weeks">
        <title>Clinical rotation schedule over 12 weeks</title>
        <desc>
          {wards
            .map((w) => `${w.name}: ${w.students} students from week ${w.start} for ${w.duration} weeks`)
            .join('; ')}
        </desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* column grid */}
          {Array.from({ length: weeks + 1 }).map((_, i) => (
            <line
              key={i}
              x1={i * colW}
              x2={i * colW}
              y1={0}
              y2={innerHeight}
              stroke={COLORS.grid}
            />
          ))}
          {wards.map((w, i) => (
            <g key={w.name}>
              <text
                x={-12}
                y={i * rowH + rowH / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fill={COLORS.text}
                fontWeight={500}
              >
                {w.name}
              </text>
              <rect
                x={(w.start - 1) * colW + 2}
                y={i * rowH + rowH * 0.22}
                width={w.duration * colW - 4}
                height={rowH * 0.56}
                rx={4}
                fill={i % 2 === 0 ? COLORS.teal : COLORS.sage}
              />
              <text
                x={(w.start - 1) * colW + w.duration * colW / 2}
                y={i * rowH + rowH / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fill="#fff"
                fontWeight={600}
              >
                {w.students}
              </text>
            </g>
          ))}
          {/* week labels */}
          {weekLabels.map((label) => {
            const n = parseInt(label.split(' ')[1], 10)
            return (
              <text
                key={label}
                x={(n - 1) * colW}
                y={innerHeight + 18}
                textAnchor="middle"
                fontSize={11}
                fill={COLORS.muted}
              >
                {label}
              </text>
            )
          })}
        </g>
      </svg>
      <p className="text-xs text-warm-700 mt-2">
        Bars show students per rotation block; numbers inside each bar indicate cohort size.
      </p>
    </div>
  )
}

function FacultyWorkload() {
  const faculty = useMemo(
    () => [
      { name: 'Dr. A. Mensah', load: 86, max: 100, role: 'Med-Surg Lead' },
      { name: 'Prof. J. Addo', load: 74, max: 100, role: 'Pediatrics' },
      { name: 'Ms. E. Boateng', load: 92, max: 100, role: 'Clinical Coord.' },
      { name: 'Dr. K. Owusu', load: 64, max: 100, role: 'Mental Health' },
      { name: 'Ms. R. Asante', load: 78, max: 100, role: 'Community Health' },
    ],
    []
  )
  const { ref, width } = useSvgWidth()
  const height = 260
  const margin = { top: 10, right: 56, bottom: 16, left: 120 }
  const innerWidth = Math.max(width - margin.left - margin.right, 100)
  const innerHeight = height - margin.top - margin.bottom
  const rowH = innerHeight / faculty.length
  const barH = rowH * 0.55

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label="Faculty workload percentage">
        <title>Faculty workload percentage</title>
        <desc>
          {faculty.map((f) => `${f.name}: ${f.load}% workload`).join('; ')}
        </desc>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {faculty.map((f, i) => {
            const y = i * rowH + rowH * 0.2
            const w = (f.load / f.max) * innerWidth
            const color = f.load >= 90 ? COLORS.lavender : f.load >= 75 ? COLORS.teal : COLORS.sage
            return (
              <g key={f.name}>
                <text
                  x={-10}
                  y={y + barH / 2 + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill={COLORS.text}
                  fontWeight={500}
                >
                  {f.name}
                </text>
                <rect x={0} y={y} width={innerWidth} height={barH} fill={COLORS.warmLight} rx={4} />
                <rect x={0} y={y} width={w} height={barH} fill={color} rx={4} />
                <text
                  x={w + 6}
                  y={y + barH / 2 + 4}
                  fontSize={11}
                  fontWeight={600}
                  fill={COLORS.text}
                >
                  {f.load}%
                </text>
              </g>
            )
          })}
        </g>
      </svg>
      <div className="flex flex-wrap gap-3 text-xs mt-2">
        <span className="flex items-center gap-1.5 text-warm-800">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.sage }}></span> Normal
        </span>
        <span className="flex items-center gap-1.5 text-warm-800">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.teal }}></span> Elevated
        </span>
        <span className="flex items-center gap-1.5 text-warm-800">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.lavender }}></span> High
        </span>
      </div>
    </div>
  )
}

function ResourceUtilization() {
  const data = useMemo(
    () => [
      { label: 'Simulation Labs', value: 78, color: COLORS.teal },
      { label: 'Skills Kits', value: 64, color: COLORS.sage },
      { label: 'Library Journals', value: 54, color: COLORS.lavender },
      { label: 'Transport', value: 42, color: COLORS.warm },
    ],
    []
  )
  const { ref, width } = useSvgWidth()
  const size = Math.min(width, 260)
  const radius = size / 2 - 20
  const cx = size / 2
  const cy = size / 2
  const total = data.reduce((a, b) => a + b.value, 0)

  let angle = -Math.PI / 2
  const slices = data.map((d) => {
    const sliceAngle = (d.value / total) * Math.PI * 2
    const start = angle
    const end = angle + sliceAngle
    angle = end
    return { ...d, start, end }
  })

  const arc = (start, end, r) => {
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const largeArc = end - start > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <div ref={ref} className="w-full flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label="Resource utilization donut chart">
        <title>Resource utilization percentages</title>
        <desc>
          {data.map((d) => `${d.label}: ${d.value}%`).join('; ')}
        </desc>
        <g>
          {slices.map((s) => (
            <path
              key={s.label}
              d={arc(s.start, s.end, radius)}
              fill={s.color}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
          <circle cx={cx} cy={cy} r={radius * 0.55} fill="#fff" />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize={12} fill={COLORS.muted}>
            Utilization
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={18} fontWeight={700} fill={COLORS.text}>
            {Math.round(data.reduce((a, b) => a + b.value, 0) / data.length)}%
          </text>
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-2 mt-4 w-full">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs text-warm-800">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }}></span>
            <span>{d.label} ({d.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NursingAnalytics() {
  return (
    <section className="mb-8 sm:mb-10" aria-labelledby="nursing-analytics-heading">
      <h3 id="nursing-analytics-heading" className="text-xl sm:text-2xl font-semibold text-teal-900 mb-4 sm:mb-6">
        Nursing College Overview
      </h3>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={HiOutlineUserGroup}
          label="Total Students"
          value="420"
          subtext="Across 4 cohorts"
          colorClass="bg-teal-100 text-teal-800"
        />
        <KpiCard
          icon={HiOutlineCalendar}
          label="Active Rotations"
          value="6"
          subtext="2 wards at capacity"
          colorClass="bg-sage-100 text-sage-800"
        />
        <KpiCard
          icon={HiOutlineAcademicCap}
          label="Faculty"
          value="24"
          subtext="3 over 90% load"
          colorClass="bg-lavender-100 text-lavender-800"
        />
        <KpiCard
          icon={HiOutlineClipboardDocumentList}
          label="Resources"
          value="82%"
          subtext="Avg. utilization"
          colorClass="bg-warm-100 text-warm-800"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-teal-100">
          <h4 className="text-base sm:text-lg font-bold text-teal-900 mb-1">Student Enrollment</h4>
          <p className="text-xs text-warm-700 mb-4">Enrollment vs. capacity by academic year</p>
          <EnrollmentChart />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-teal-100">
          <h4 className="text-base sm:text-lg font-bold text-teal-900 mb-1">Clinical Rotation Schedule</h4>
          <p className="text-xs text-warm-700 mb-4">12-week rotation blocks by clinical ward</p>
          <RotationSchedule />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-teal-100">
          <h4 className="text-base sm:text-lg font-bold text-teal-900 mb-1">Faculty Workload</h4>
          <p className="text-xs text-warm-700 mb-4">Teaching and clinical supervision load</p>
          <FacultyWorkload />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-teal-100">
          <h4 className="text-base sm:text-lg font-bold text-teal-900 mb-1">Resource Utilization</h4>
          <p className="text-xs text-warm-700 mb-4">Usage rate of core nursing teaching resources</p>
          <ResourceUtilization />
        </div>
      </div>
    </section>
  )
}
