import React, { useMemo } from 'react'
import { IconTarget, IconMoonStars, IconNotebook, IconSparkles } from '@tabler/icons-react'

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
      <div className="mt-8 mb-4 w-full">
        <div className="flex items-center gap-2 text-indigo-800">
          <IconTarget size={22} />
          <h2 className="text-xl font-bold">Goals Over Urges</h2>
        </div>
        <p className="text-sm text-indigo-700/80 mt-1">
          Goals over urges. Practical if-then plans for key situations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2 text-indigo-900">
              {iconFor(sec.title)}
              <h3 className="font-semibold">{sec.title}</h3>
            </div>
            <ul className="space-y-2">
              {sec.items.map((it, idx) => (
                <li
                  key={idx}
                  className="bg-white/90 border border-indigo-100 rounded-md p-2 text-sm text-gray-800"
                >
                  {stripOrgArtifacts(it)}
                </li>
              ))}
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
  if (/(sleep|night|bed)/.test(t)) return <IconMoonStars size={18} className="text-indigo-700" />
  if (/(write|product)/.test(t)) return <IconNotebook size={18} className="text-indigo-700" />
  return <IconSparkles size={18} className="text-indigo-700" />
}
