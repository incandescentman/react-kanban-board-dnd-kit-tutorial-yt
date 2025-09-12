import React from 'react'
import { IconAlertTriangle, IconSparkles } from '@tabler/icons-react'

const items: { trigger: string; response: string }[] = [
  {
    trigger: "I'll start tomorrow",
    response: 'The future is built now — today counts.',
  },
  {
    trigger: "It won't matter this once",
    response: 'Every choice either feeds my goals or my impulses. Choose goals.',
  },
  {
    trigger: 'Just one more [bite / episode / scroll]…',
    response: 'Urges rise and fall. Pride lasts longer than pleasure.',
  },
  {
    trigger: "I don't feel like it",
    response: 'Discipline means acting independent of mood. Do 2 minutes now.',
  },
  {
    trigger: 'I already blew it today',
    response: "I'm human. The next choice matters most — reset now.",
  },
  {
    trigger: 'I deserve a treat',
    response: 'Treat yourself with alignment. Choose what future‑me wants.',
  },
  {
    trigger: 'This is too hard',
    response: "This is hard — and I'm doing it anyway.",
  },
  {
    trigger: 'I’ll be more motivated later',
    response: 'Action creates motivation. Start tiny and momentum will follow.',
  },
]

export default function TriggersResponses() {
  return (
    <div className="flex flex-col min-w-0 flex-1">
      <div className="mt-0 mb-4 w-full">
        <div className="flex items-center gap-3 text-indigo-800">
          <IconAlertTriangle size={28} />
          <h2 className="text-xl font-bold">Thought → Reframe</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((it, idx) => (
          <section
            key={idx}
            className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 text-red-600">
                <IconAlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 mb-1">Trigger</div>
                <div className="text-sm text-gray-800">{it.trigger}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <div className="shrink-0 mt-0.5 text-indigo-700">
                <IconSparkles size={22} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 mb-1">Mantra</div>
                <div className="text-sm text-gray-800">{it.response}</div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
