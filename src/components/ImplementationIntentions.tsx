import React, { useMemo } from 'react'
import { IconGymnastics, IconMoonStars, IconNotebook, IconSparkles, IconScale, IconMessageCircle, IconTarget } from '@tabler/icons-react'

// Import the .org file content as raw text at build-time
// Vite supports ?raw to import file contents as string
// The file lives at repo root: implementation-intentions.org
// Path from this file: ../../implementation-intentions.org
// If this file moves, update the relative path below.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will provide this at runtime
import ORG_CONTENT from '../../implementation-intentions.org?raw'

type Section = {
  title: string
  items: string[]
}

function parseOrgToSections(text: string): Section[] {
  const lines = text.split(/\r?\n/)
  const sections: Section[] = []
  let current: Section | null = null

  const pushCurrent = () => {
    if (current) {
      // trim empties
      current.items = current.items.filter((s) => s && s.trim().length)
      sections.push(current)
    }
    current = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Level-2 headings start with **
    if (line.startsWith('** ')) {
      pushCurrent()
      current = { title: line.replace(/^\*\*\s+/, ''), items: [] }
      continue
    }

    // Bullets begin with - or * (common in org)
    if (/^[-*]\s+/.test(line)) {
      const item = line.replace(/^[-*]\s+/, '').replace(/\s+\\n?$/, '')
      if (!current) {
        current = { title: 'Notes', items: [] }
      }
      current.items.push(item)
      continue
    }

    // Fallback: treat plain lines under an open section as items
    if (current) {
      current.items.push(line)
    }
  }
  pushCurrent()
  return sections
}

export default function ImplementationIntentions() {
  const sections = useMemo(() => parseOrgToSections(String(ORG_CONTENT || '')), [])

  return (
    <div className="flex flex-col min-w-0 flex-1">
      <div className="mt-0 mb-4 w-full">
        <div className="flex items-center gap-3 text-indigo-800">
          <IconGymnastics size={28} />
          <h2 className="text-xl font-bold">Goals Over Urges</h2>
        </div>
        {/* subtitle intentionally removed per request */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2 text-indigo-900">
              {iconFor(sec.title)}
              <h3 className="font-semibold text-base">{prettyTitle(sec.title)}</h3>
            </div>
            <ul className="space-y-2">
              {sec.items.map((it, idx) => {
                const { ifPart, thenPart } = parseIfThen(stripOrgArtifacts(it))
                return (
                  <li key={idx} className="bg-white/90 border border-indigo-100 rounded-md p-3 text-sm text-gray-800">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 text-blue-900"><IconMessageCircle size={20} /></div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">If</div>
                        <div className="text-sm text-gray-800">{ifPart || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-3">
                      <div className="shrink-0 mt-0.5 text-indigo-700"><IconTarget size={20} /></div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 mb-0.5">Then</div>
                        <div className="text-sm text-gray-800">{thenPart || stripOrgArtifacts(it)}</div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function stripOrgArtifacts(s: string): string {
  // Remove trailing double spaces + line breaks used for hard newlines in org
  return s.replace(/\s+\\n$/g, '')
}

function iconFor(title: string): React.ReactNode {
  const t = title.toLowerCase()
  if (/(food|sugar|nutrition)/.test(t)) return <IconScale size={24} className="text-indigo-700" />
  if (/(sleep|night|bed)/.test(t)) return <IconMoonStars size={24} className="text-indigo-700" />
  if (/(write|writing|product)/.test(t)) return <IconNotebook size={24} className="text-indigo-700" />
  if (/(reframe|mantra|notes)/.test(t)) return <IconSparkles size={24} className="text-indigo-700" />
  return <IconSparkles size={24} className="text-indigo-700" />
}

function prettyTitle(title: string): string {
  const t = title.trim()
  const lower = t.toLowerCase()
  if (/(food|sugar)/.test(lower)) return 'Nutrition'
  if (/^notes$/i.test(t) || /(reframe|mantra)/i.test(t)) return 'Master Mantras'
  if (/(write|writing)/.test(lower)) return 'Writing'
  return t
}

function parseIfThen(text: string): { ifPart: string; thenPart: string } {
  const t = text.trim()
  // Common patterns: "If ... then ..." with optional comma/semicolon
  const m = t.match(/^\s*if\s+(.+?)[,;]?\s+then\s+(.+)$/i)
  if (m) {
    return { ifPart: m[1].trim(), thenPart: m[2].trim() }
  }
  // Fallback: split on " then " if present
  const idx = t.toLowerCase().indexOf(' then ')
  if (idx > -1) {
    return { ifPart: t.slice(0, idx).replace(/^if\s+/i, '').trim(), thenPart: t.slice(idx + 6).trim() }
  }
  // No match — treat whole line as the action
  return { ifPart: '', thenPart: t }
}
