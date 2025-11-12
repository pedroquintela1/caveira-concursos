'use client'

import { CadernoTabs } from './caderno-tabs'
import { CadernoIndice } from './caderno-indice'
import { CadernoGabarito } from './caderno-gabarito'
import { CadernoEstatisticas } from './caderno-estatisticas'
import { CadernoConfiguracoes } from './caderno-configuracoes'

interface CadernoTabsWrapperProps {
  cadernoId: number
  questoesTab: React.ReactNode
}

export function CadernoTabsWrapper({ cadernoId, questoesTab }: CadernoTabsWrapperProps) {
  return (
    <CadernoTabs
      cadernoId={cadernoId}
      children={{
        questoes: questoesTab,
        indice: <CadernoIndice cadernoId={cadernoId} />,
        estatisticas: <CadernoEstatisticas cadernoId={cadernoId} />,
        gabarito: <CadernoGabarito cadernoId={cadernoId} />,
        configuracoes: <CadernoConfiguracoes cadernoId={cadernoId} />,
      }}
    />
  )
}
