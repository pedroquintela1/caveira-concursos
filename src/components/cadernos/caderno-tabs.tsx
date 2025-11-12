'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, List, BarChart3, CheckSquare, Settings } from 'lucide-react'

interface CadernoTabsProps {
  cadernoId: number
  children: {
    questoes: React.ReactNode
    indice?: React.ReactNode
    estatisticas?: React.ReactNode
    gabarito?: React.ReactNode
    configuracoes?: React.ReactNode
  }
  defaultTab?: string
}

export function CadernoTabs({ cadernoId, children, defaultTab = 'questoes' }: CadernoTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-gray-900 border border-gray-800">
        <TabsTrigger
          value="questoes"
          className="data-[state=active]:bg-[#8fbc8f] data-[state=active]:text-gray-900"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Questões</span>
        </TabsTrigger>
        <TabsTrigger
          value="indice"
          className="data-[state=active]:bg-[#8fbc8f] data-[state=active]:text-gray-900"
        >
          <List className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Índice</span>
        </TabsTrigger>
        <TabsTrigger
          value="estatisticas"
          className="data-[state=active]:bg-[#8fbc8f] data-[state=active]:text-gray-900"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Estatísticas</span>
        </TabsTrigger>
        <TabsTrigger
          value="gabarito"
          className="data-[state=active]:bg-[#8fbc8f] data-[state=active]:text-gray-900"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Gabarito</span>
        </TabsTrigger>
        <TabsTrigger
          value="configuracoes"
          className="data-[state=active]:bg-[#8fbc8f] data-[state=active]:text-gray-900"
        >
          <Settings className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Config</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="questoes" className="mt-6">
        {children.questoes}
      </TabsContent>

      <TabsContent value="indice" className="mt-6">
        {children.indice || (
          <div className="text-center py-12 text-gray-400">
            Tab Índice em desenvolvimento...
          </div>
        )}
      </TabsContent>

      <TabsContent value="estatisticas" className="mt-6">
        {children.estatisticas || (
          <div className="text-center py-12 text-gray-400">
            Tab Estatísticas em desenvolvimento...
          </div>
        )}
      </TabsContent>

      <TabsContent value="gabarito" className="mt-6">
        {children.gabarito || (
          <div className="text-center py-12 text-gray-400">
            Tab Gabarito em desenvolvimento...
          </div>
        )}
      </TabsContent>

      <TabsContent value="configuracoes" className="mt-6">
        {children.configuracoes || (
          <div className="text-center py-12 text-gray-400">
            Tab Configurações em desenvolvimento...
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
