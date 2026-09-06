// Gaming PC section copy

import { ACTS, SURFACES } from './pcContent'

export const SECTION_HEADING_ID = 'gp-heading'

export default function PCCopy() {
  const names = Object.keys(SURFACES)

  return (
    <>
      {names.map((name, index) => {
        const spec = SURFACES[name]
        const acts = ACTS.filter((act) => (act.surface ?? names[0]) === name)
        if (!acts.length) return null

        return (
          <div
            key={name}
            data-gp="surface"
            data-gp-surface={name}
            style={{ width: `${spec.size[0]}px`, height: `${spec.size[1]}px`, zIndex: index + 1 }}
          >
            {acts.map((act) => {
              const Tag = act.isSectionHeading ? 'h2' : 'p'
              return (
                <div key={act.id} data-gp="act" data-act={act.id}>
                  <Tag data-gp="heading" id={act.isSectionHeading ? SECTION_HEADING_ID : undefined}>
                    {act.heading}
                  </Tag>
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}
