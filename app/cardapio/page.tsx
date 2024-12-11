'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import espetinhos from '../../data/espetinhos.json'
import bebidas from '../../data/bebidas.json'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Home } from 'lucide-react'

interface EspetinhoCarrinho {
  id: number
  nome: string
  preco: number
  quantidade: number
  tamanho?: string
}

function CardapioContent() {
  const searchParams = useSearchParams()
  const [carrinho, setCarrinho] = useState<EspetinhoCarrinho[]>(() => {
    const carrinhoParam = searchParams.get('carrinho')
    if (carrinhoParam) {
      try {
        return JSON.parse(carrinhoParam)
      } catch (error) {
        console.error('Erro ao parsear o carrinho:', error)
        return []
      }
    }
    return []
  })

  // Correção na tipagem do estado inicial
  const [espetinhosQuantidade, setEspetinhosQuantidade] = useState<{ [key: number]: { quantidade: number, tamanho: 'Simples' | 'Acompanhamento (completo)' } }>(
    espetinhos.reduce((acc: { [key: number]: { quantidade: number, tamanho: 'Simples' | 'Acompanhamento (completo)' } }, espetinho) => {
      acc[espetinho.id] = { quantidade: 1, tamanho: 'Simples' };
      return acc;
    }, {})
  )

  const [bebidasQuantidade, setBebidasQuantidade] = useState<{ [key: number]: { quantidade: number } }>({})

  const atualizarQuantidadeEspetinho = (
    espetinhoId: number, 
    quantidade: number, 
    tamanho: 'Simples' | 'Acompanhamento (completo)'
  ) => {
    setEspetinhosQuantidade(prev => ({
      ...prev,
      [espetinhoId]: { quantidade, tamanho }
    }))
  }

  const atualizarQuantidadeBebida = (bebidaId: number, quantidade: number) => {
    setBebidasQuantidade(prev => ({
      ...prev,
      [bebidaId]: { quantidade }
    }))
  }

  const adicionarAoCarrinho = (item: typeof espetinhos[0] | typeof bebidas[0], tipo: 'espetinho' | 'bebida') => {
    if (tipo === 'espetinho') {
      const espetinho = item as typeof espetinhos[0]
      const detalhes = espetinhosQuantidade[espetinho.id] || { quantidade: 1, tamanho: 'Simples' }
      const espetinhoNoCarrinho: EspetinhoCarrinho = {
        id: espetinho.id,
        nome: espetinho.nome,
        preco: espetinho.precos[detalhes.tamanho === 'Simples' ? 'Simples' : 'Acompanhamento'],
        quantidade: detalhes.quantidade,
        tamanho: detalhes.tamanho
      }

      const carrinhoAtualizado = [...carrinho]
      const indiceExistente = carrinhoAtualizado.findIndex(item =>
        item.id === espetinhoNoCarrinho.id && item.tamanho === espetinhoNoCarrinho.tamanho
      )

      if (indiceExistente > -1) {
        carrinhoAtualizado[indiceExistente].quantidade += espetinhoNoCarrinho.quantidade
      } else {
        carrinhoAtualizado.push(espetinhoNoCarrinho)
      }

      setCarrinho(carrinhoAtualizado)
    } else {
      const bebida = item as typeof bebidas[0]
      const detalhes = bebidasQuantidade[bebida.id] || { quantidade: 1 }
      const bebidaNoCarrinho: EspetinhoCarrinho = {
        id: bebida.id,
        nome: bebida.nome,
        preco: bebida.preco,
        quantidade: detalhes.quantidade
      }

      const carrinhoAtualizado = [...carrinho]
      const indiceExistente = carrinhoAtualizado.findIndex(item =>
        item.id === bebidaNoCarrinho.id
      )

      if (indiceExistente > -1) {
        carrinhoAtualizado[indiceExistente].quantidade += bebidaNoCarrinho.quantidade
      } else {
        carrinhoAtualizado.push(bebidaNoCarrinho)
      }

      setCarrinho(carrinhoAtualizado)
    }
  }

  const valorTotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0)

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url("/img/fundo.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Botão de Home */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 bg-[#ff6f00] text-white p-3 rounded-full shadow-lg hover:bg-[#ff8f00] flex items-center"
      >
        <Home className="w-4 h-4 md:w-6 md:h-6" />
      </Link>
      {/* Overlay escuro para melhorar a legibilidade e profundidade */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 container mx-auto px-2 md:px-4 py-4 md:py-8 min-h-screen">
        {/* Botão de Carrinho Flutuante */}
        {carrinho.length > 0 && (
          <Link
            href={{
              pathname: '/pedidos',
              query: { carrinho: JSON.stringify(carrinho) }
            }}
            className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 bg-[#ff6f00] text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-[#ff8f00] flex items-center text-sm md:text-base"
          >
            <ShoppingCart className="mr-1 md:mr-2 w-4 h-4 md:w-6 md:h-6" />
            {carrinho.length} | R$ {valorTotal.toFixed(2)}
          </Link>
        )}

        {/* Seção de Espetinhos */}
        <div className="p-4 md:p-6 rounded-2xl shadow-lg mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-[#ff6f00]">
            Nossos Espetinhos
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {espetinhos.map((espetinho) => (
              <div
                key={espetinho.id}
                className="border rounded-lg overflow-hidden shadow-md bg-[#5d4037]/80 p-3 md:p-4 text-white"
              >
                <Image
                  src={espetinho.imagem}
                  alt={espetinho.nome}
                  width={400}
                  height={300}
                  className="w-full h-40 md:h-48 object-cover rounded-t-lg"
                />
                <div className="mt-2 md:mt-4">
                  <h2 className="text-lg md:text-xl font-semibold text-[#ff6f00]">
                    {espetinho.nome}
                  </h2>
                  <p className="text-sm md:text-base text-white mb-2">{espetinho.descricao}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-2 sm:space-y-0">
                    <span className="text-base md:text-lg font-bold text-[#e9e2dd]">
                      R$ {(
                        espetinho.precos[
                          espetinhosQuantidade[espetinho.id]?.tamanho === 'Simples' 
                            ? 'Simples' 
                            : 'Acompanhamento'
                        ]
                      ).toFixed(2)}
                    </span>
                    <select
                      value={espetinhosQuantidade[espetinho.id]?.tamanho || 'Simples'}
                      onChange={(e) => {
                        const tamanhoSelecionado = e.target.value as 'Simples' | 'Acompanhamento (completo)'
                        atualizarQuantidadeEspetinho(
                          espetinho.id,
                          espetinhosQuantidade[espetinho.id]?.quantidade || 1,
                          tamanhoSelecionado
                        )
                      }}
                      className="border rounded px-2 py-1 text-sm w-full sm:w-auto bg-[#4a2c2a] text-white"
                    >
                      {espetinho.tamanhos.map(tamanho => (
                        <option key={tamanho} value={tamanho}>
                          {tamanho}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={espetinhosQuantidade[espetinho.id]?.quantidade || 1}
                      onChange={(e) => {
                        const quantidade = parseInt(e.target.value)
                        atualizarQuantidadeEspetinho(
                          espetinho.id,
                          quantidade,
                          espetinhosQuantidade[espetinho.id]?.tamanho || 'Simples'
                        )
                      }}
                      className="w-full sm:w-16 border rounded px-2 py-1 text-center text-sm bg-[#4a2c2a] text-white"
                    />
                    <button
                      onClick={() => adicionarAoCarrinho(espetinho, 'espetinho')}
                      className="w-full sm:flex-1 bg-[#ff6f00] text-white py-2 rounded hover:bg-[#ff8f00] text-sm"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Bebidas */}
        <div className="p-4 md:p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-[#ff6f00]">
            Nossas Bebidas
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {bebidas.map((bebida) => (
              <div
                key={bebida.id}
                className="border rounded-lg overflow-hidden shadow-md bg-[#5d4037]/80 p-3 md:p-4 text-white"
              >
                <Image
                  src={bebida.imagem}
                  alt={bebida.nome}
                  width={400}
                  height={300}
                  className="w-full h-40 md:h-48 object-cover rounded-t-lg"
                />
                <div className="mt-2 md:mt-4">
                  <h2 className="text-lg md:text-xl font-semibold text-[#ff6f00]">
                    {bebida.nome}
                  </h2>
                  <p className="text-sm md:text-base text-white mb-2">{bebida.descricao}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-2 sm:space-y-0">
                    <span className="text-base md:text-lg font-bold text-[#e9e2dd]">
                      R$ {bebida.preco.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={bebidasQuantidade[bebida.id]?.quantidade || 1}
                      onChange={(e) => {
                        const quantidade = parseInt(e.target.value)
                        atualizarQuantidadeBebida(bebida.id, quantidade)
                      }}
                      className="w-full sm:w-16 border rounded px-2 py-1 text-center text-sm bg-[#4a2c2a] text-white"
                    />
                    <button
                      onClick={() => adicionarAoCarrinho(bebida, 'bebida')}
                      className="w-full sm:flex-1 bg-[#ff6f00] text-white py-2 rounded hover:bg-[#ff8f00] text-sm"
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cardapio() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-white">Carregando...</div>}>
      <CardapioContent />
    </Suspense>
  )
}