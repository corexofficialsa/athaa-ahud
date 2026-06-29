import { TOTAL_PAGES, JUZ } from './quranData.js'

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export function calcPerformanceScore(answers) {
  const scores = {
    q1: { A: 100, B: 75,  C: 50,  D: 25  },
    q2: { A: 100, B: 70,  C: 40,  D: 15  },
    q3: { A: 100, B: 75,  C: 50,  D: 25  },
    q4: { A: 100, B: 80,  C: 60,  D: 40  },
  }
  const s1 = scores.q1[answers.q1] ?? 50
  const s2 = scores.q2[answers.q2] ?? 50
  const s3 = scores.q3[answers.q3] ?? 50
  const s4 = scores.q4[answers.q4] ?? 50
  return Math.round((s1 + s2 + s3 + s4) / 4)
}

export function getDailyNewPages(performanceScore, dayNumber) {
  if (performanceScore >= 80) {
    if (dayNumber <= 7)  return 5
    if (dayNumber <= 21) return 10
    return 20
  } else {
    if (dayNumber <= 7)  return 2
    if (dayNumber <= 21) return 5
    return 10
  }
}

export function getDailyMurajaPages(performanceScore) {
  return performanceScore >= 80 ? 20 : 10
}

export function isWeekend(date, weekendDays) {
  const dayName = DAY_NAMES[date.getDay()]
  return weekendDays.includes(dayName)
}

export function addWorkingDays(startDate, days, weekendDays) {
  let d = new Date(startDate)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (!isWeekend(d, weekendDays)) added++
  }
  return d
}

export function buildSchedule({ startPage, startDate, weekendDays, juzRatings, performanceScore }) {
  const totalNewPages  = TOTAL_PAGES - startPage + 1
  const highJuzPages   = calcHighJuzPages(juzRatings)

  const schedule = []
  let currentPage  = startPage
  let currentMurajaPage = getFirstHighPage(juzRatings)
  let completedNewPages = 0
  let murajaPool   = highJuzPages  // initial muraja pool from high-rated juz

  const dateObj    = new Date(startDate)
  let dayNumber    = 0
  let calendarDay  = new Date(startDate)

  while (completedNewPages < totalNewPages || murajaPool > 0) {
    dayNumber++
    const newPagesForDay   = Math.min(getDailyNewPages(performanceScore, dayNumber), totalNewPages - completedNewPages)
    const murajaPagesForDay = murajaPool > 0 ? Math.min(getDailyMurajaPages(performanceScore), murajaPool) : 0

    const entry = {
      day: dayNumber,
      date: new Date(calendarDay).toISOString(),
      isWeekend: isWeekend(calendarDay, weekendDays),
      newLesson: {
        startPage: currentPage,
        endPage: currentPage + newPagesForDay - 1,
        pages: newPagesForDay,
      },
      muraja: {
        startPage: currentMurajaPage,
        endPage: currentMurajaPage + murajaPagesForDay - 1,
        pages: murajaPagesForDay,
      },
    }

    if (!entry.isWeekend) {
      schedule.push(entry)
      currentPage += newPagesForDay
      completedNewPages += newPagesForDay
      currentMurajaPage += murajaPagesForDay
      murajaPool -= murajaPagesForDay

      // Once previous new lesson finishes, add those pages to muraja pool
      if (dayNumber > 1 && schedule.length > 1) {
        const prev = schedule[schedule.length - 2]
        murajaPool += prev.newLesson.pages
      }

      if (currentPage > TOTAL_PAGES && murajaPool <= 0) break
    }

    calendarDay.setDate(calendarDay.getDate() + 1)
    if (dayNumber > 1000) break // safety
  }

  return {
    schedule,
    totalDays: schedule.length,
    estimatedCompletionDate: schedule.length > 0 ? schedule[schedule.length - 1].date : startDate,
    performanceScore,
    totalNewPages,
  }
}

function calcHighJuzPages(juzRatings) {
  return (juzRatings || [])
    .filter(r => r.level === 'high')
    .reduce((sum, r) => sum + (r.pages || 20), 0)
}

function getFirstHighPage(juzRatings) {
  const firstHigh = (juzRatings || []).find(r => r.level === 'high')
  if (!firstHigh) return 1
  const juzInfo = JUZ.find(j => j.number === firstHigh.juz)
  return juzInfo ? juzInfo.startPage : 1
}

export function getTodaySchedule(schedule, startDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const entry = schedule.find(entry => {
    const d = new Date(entry.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })
  return entry || null
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function generateRollNumber() {
  return String(Math.floor(10000 + Math.random() * 90000))
}
