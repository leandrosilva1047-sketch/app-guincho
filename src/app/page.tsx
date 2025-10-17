"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Truck, 
  Clock, 
  Phone, 
  CreditCard, 
  DollarSign,
  Navigation,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface Guincho {
  id: string
  nome: string
  placa: string
  foto: string
  rating: number
  distancia: number
  tempoChegada: number
  lat: number
  lng: number
  disponivel: boolean
}

interface Corrida {
  id: string
  origem: string
  destino: string
  distancia: number
  preco: number
  status: 'solicitando' | 'aceita' | 'a_caminho' | 'chegou' | 'finalizada'
  guincho?: Guincho
  tempoEstimado?: number
}

export default function GuinchoApp() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [orcamento, setOrcamento] = useState<number | null>(null)
  const [corrida, setCorrida] = useState<Corrida | null>(null)
  const [guinchos, setGuinchos] = useState<Guincho[]>([])
  const [localizacaoAtual, setLocalizacaoAtual] = useState({ lat: -23.5505, lng: -46.6333 })
  const [etapaAtual, setEtapaAtual] = useState<'inicio' | 'orcamento' | 'solicitando' | 'acompanhando' | 'pagamento'>('inicio')
  const [kmCalculado, setKmCalculado] = useState<number | null>(null)
  const [processando, setProcessando] = useState(false)

  // Simular guinchos disponíveis
  useEffect(() => {
    const guinchosMock: Guincho[] = [
      {
        id: '1',
        nome: 'Leandro Silva',
        placa: 'ABC-1234',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 4.8,
        distancia: 2.3,
        tempoChegada: 8,
        lat: -23.5485,
        lng: -46.6313,
        disponivel: true
      },

      {
        id: '3',
        nome: 'Daniel Motorista',
        placa: 'GHI-9012',
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 4.7,
        distancia: 3.1,
        tempoChegada: 12,
        lat: -23.5465,
        lng: -46.6293,
        disponivel: true
      }
    ]
    setGuinchos(guinchosMock)
  }, [])

  // Função para calcular distância estimada baseada nos endereços
  const calcularDistanciaEstimada = (origem: string, destino: string): number => {
    // Simulação simples baseada no comprimento dos endereços e palavras-chave
    const origemLower = origem.toLowerCase()
    const destinoLower = destino.toLowerCase()
    
    // Distâncias base por região/cidade
    const distanciaBase = 25
    
    // Ajustes baseados em palavras-chave comuns
    let multiplicador = 1
    
    if (origemLower.includes('centro') || destinoLower.includes('centro')) {
      multiplicador *= 0.8
    }
    if (origemLower.includes('aeroporto') || destinoLower.includes('aeroporto')) {
      multiplicador *= 1.5
    }
    if (origemLower.includes('shopping') || destinoLower.includes('shopping')) {
      multiplicador *= 1.2
    }
    
    // Adiciona variação aleatória para simular cálculo real
    const variacao = 0.8 + Math.random() * 0.4 // Entre 0.8 e 1.2
    
    return Math.round(distanciaBase * multiplicador * variacao * 10) / 10
  }

  // Função para atualizar quilometragem quando ambos os campos estão preenchidos
  const atualizarKilometragem = () => {
    if (origem.trim() && destino.trim()) {
      setProcessando(true)
      
      setTimeout(() => {
        const kmEstimado = calcularDistanciaEstimada(origem, destino)
        setKmCalculado(kmEstimado)
        
        // Atualizar display de km
        const kmInfo = document.getElementById('kmInfo')
        if (kmInfo) {
          kmInfo.textContent = `Distância estimada: ${kmEstimado.toFixed(1)} km`
        }
        setProcessando(false)
      }, 1500)
    }
  }

  // Atualizar quilometragem quando origem ou destino mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      atualizarKilometragem()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timer)
  }, [origem, destino])

  const calcularOrcamento = () => {
    if (!origem || !destino) return

    setProcessando(true)
    
    setTimeout(() => {
      // Usar quilometragem calculada ou valor padrão
      const km = kmCalculado || 35
      const valorCalculado = km <= 40 ? 150 : 180
      
      setOrcamento(valorCalculado)
      setEtapaAtual('orcamento')
      setProcessando(false)
    }, 2000)
  }

  const solicitarGuincho = () => {
    if (!orcamento) return

    // Encontrar guincho mais próximo
    const guinchoMaisProximo = guinchos
      .filter(g => g.disponivel)
      .sort((a, b) => a.distancia - b.distancia)[0]

    const novaCorrida: Corrida = {
      id: Date.now().toString(),
      origem,
      destino,
      distancia: kmCalculado || 35,
      preco: orcamento,
      status: 'solicitando',
      guincho: guinchoMaisProximo,
      tempoEstimado: guinchoMaisProximo.tempoChegada
    }

    setCorrida(novaCorrida)
    setEtapaAtual('solicitando')

    // Simular aceitação da corrida
    setTimeout(() => {
      setCorrida(prev => prev ? { ...prev, status: 'aceita' } : null)
      setEtapaAtual('acompanhando')
    }, 3000)

    // Simular chegada do guincho
    setTimeout(() => {
      setCorrida(prev => prev ? { ...prev, status: 'a_caminho' } : null)
    }, 5000)

    setTimeout(() => {
      setCorrida(prev => prev ? { ...prev, status: 'chegou' } : null)
    }, 15000)
  }

  const finalizarCorrida = () => {
    setCorrida(prev => prev ? { ...prev, status: 'finalizada' } : null)
    setEtapaAtual('pagamento')
  }

  const reiniciarApp = () => {
    setOrigem('')
    setDestino('')
    setOrcamento(null)
    setCorrida(null)
    setEtapaAtual('inicio')
    setKmCalculado(null)
    setProcessando(false)
  }

  const renderMapa = () => (
    <Card className="w-full h-80 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
      <CardContent className="p-0 h-full relative">
        {/* Simulação do mapa */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          {/* Sua localização */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600">Você</span>
          </div>
          
          {/* Guinchos disponíveis */}
          {guinchos.filter(g => g.disponivel).map((guincho, index) => (
            <div 
              key={guincho.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                index === 0 ? 'top-1/3 left-1/3' : 
                index === 1 ? 'top-2/3 left-2/3' : 
                'top-1/4 right-1/4'
              }`}
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <Truck className="w-3 h-3 text-white" />
              </div>
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-orange-600">
                {guincho.distancia}km
              </span>
            </div>
          ))}

          {/* Guincho selecionado em movimento */}
          {corrida && corrida.status === 'a_caminho' && (
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-600">
                A caminho
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium">São Paulo, SP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (etapaAtual === 'inicio') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">LS Guincho</h1>
            <p className="text-gray-600">Seu guincho em minutos</p>
          </div>

          {/* Mapa */}
          {renderMapa()}

          {/* Formulário de solicitação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-orange-500" />
                Solicitar Guincho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-w-xl">
                <label className="text-sm font-medium text-gray-700">Quilometragem (calculada automaticamente)</label>
                <Input
                  id="origem"
                  placeholder="Origem (ex.: Rua A, 123)"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="w-full border rounded p-2"
                  disabled={processando}
                />
                <Input
                  id="destino"
                  placeholder="Destino (ex.: Rua B, 456)"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full border rounded p-2"
                  disabled={processando}
                />
                <div className="flex justify-between mt-2">
                  <span id="kmInfo" className="text-sm text-gray-600 flex items-center gap-2">
                    {processando && origem && destino ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculando distância...
                      </>
                    ) : (
                      kmCalculado ? `Distância estimada: ${kmCalculado.toFixed(1)} km` : '—'
                    )}
                  </span>
                  <strong className="text-sm">Distância até 40 km valor de R$ 150.00 passou de 45 km R$ 180.00</strong>
                </div>
              </div>

              <Button 
                onClick={calcularOrcamento}
                disabled={!origem || !destino || processando}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Calcular Orçamento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Guinchos disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Guinchos Próximos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guinchos.filter(g => g.disponivel).slice(0, 3).map((guincho) => (
                  <div key={guincho.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={guincho.foto} 
                        alt={guincho.nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-lg">{guincho.nome}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{guincho.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{guincho.distancia}km</p>
                      <p className="text-xs text-gray-500">{guincho.tempoChegada} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (etapaAtual === 'orcamento') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Orçamento</h1>
            <p className="text-gray-600">Confirme os detalhes da sua corrida</p>
          </div>

          {/* Detalhes da corrida */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold text-green-600">
                R$ {orcamento?.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm text-gray-500">Saída de Base</p>
                    <p className="font-medium">Rua Dona Deolinda Pereira de Souza 516, Campo Grande - MS</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm text-gray-500">Origem</p>
                    <p className="font-medium">{origem}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm text-gray-500">Destino</p>
                    <p className="font-medium">{destino}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxa base</span>
                  <span>R$ 41,63</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor da corrida</span>
                  <span>R$ {((kmCalculado || 35) <= 40 ? 150 : 180).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Quilometragem: {kmCalculado ? `${kmCalculado.toFixed(1)}km` : 'Calculando...'}</span>
                  <span>{(kmCalculado || 35) <= 40 ? 'Até 40km' : 'Acima de 40km'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {orcamento?.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEtapaAtual('inicio')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={solicitarGuincho}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Confirmar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (etapaAtual === 'solicitando') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Procurando Guincho</h1>
            <p className="text-gray-600">Aguarde enquanto encontramos o melhor motorista</p>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium">Conectando com motorista...</p>
              <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (etapaAtual === 'acompanhando' && corrida) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Status da corrida */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                {corrida.status === 'aceita' && (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-green-600">Corrida Aceita!</h2>
                    <p className="text-gray-600">O motorista está a caminho</p>
                  </>
                )}
                {corrida.status === 'a_caminho' && (
                  <>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-blue-600">A Caminho</h2>
                    <p className="text-gray-600">Chegada em ~{corrida.tempoEstimado} minutos</p>
                  </>
                )}
                {corrida.status === 'chegou' && (
                  <>
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-orange-600">Guincho Chegou!</h2>
                    <p className="text-gray-600">O motorista está te esperando</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mapa */}
          {renderMapa()}

          {/* Informações do motorista */}
          {corrida.guincho && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Seu Motorista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={corrida.guincho.foto} 
                    alt={corrida.guincho.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Leandro Silva</h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{corrida.guincho.rating} • Placa: {corrida.guincho.placa}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {corrida.tempoEstimado} min
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalhes da corrida */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Corrida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor total</span>
                <span className="font-bold text-green-600">R$ {corrida.preco.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distância</span>
                <span>{corrida.distancia.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Origem</span>
                <span className="text-right text-sm">{corrida.origem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destino</span>
                <span className="text-right text-sm">{corrida.destino}</span>
              </div>
            </CardContent>
          </Card>

          {corrida.status === 'chegou' && (
            <Button 
              onClick={finalizarCorrida}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Finalizar Corrida
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (etapaAtual === 'pagamento' && corrida) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Corrida Finalizada!</h1>
            <p className="text-gray-600">Escolha a forma de pagamento</p>
          </div>

          {/* Resumo da corrida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                <span className="text-3xl font-bold text-green-600">R$ {corrida.preco.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center text-sm text-gray-600">
                <p>Corrida de {corrida.distancia.toFixed(1)}km concluída</p>
                <p>Motorista: {corrida.guincho?.nome}</p>
              </div>
            </CardContent>
          </Card>

          {/* Opções de pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Formas de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                <div className="w-6 h-6 bg-white rounded mr-3 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">PIX</span>
                </div>
                Pagar com PIX - Instantâneo
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
                Cartão de Crédito/Débito
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-5 h-5 mr-3 text-green-500" />
                Dinheiro (Pagar ao motorista)
              </Button>
            </CardContent>
          </Card>

          {/* Avaliação */}
          <Card>
            <CardHeader>
              <CardTitle>Avalie sua experiência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-8 h-8 text-yellow-500 fill-current cursor-pointer hover:scale-110 transition-transform" />
                ))}
              </div>
              <Button 
                onClick={reiniciarApp}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Finalizar e Avaliar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}