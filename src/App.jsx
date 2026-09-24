import { useState, useEffect } from 'react'
import FormularioAviso from './componentes/FormularioAviso'
import ListaAvisos from './componentes/ListaAvisos'

const API_URL = 'https://jsonplaceholder.typicode.com/posts'

function App() {
  // Lista de avisos (array de objetos)
  const [avisos, setAvisos] = useState([])

  // Estados do GET inicial
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Estados das operações (POST, PUT, DELETE)
  const [enviando, setEnviando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erroOperacao, setErroOperacao] = useState('')

  // Aviso que está sendo editado (null = modo "Novo aviso")
  const [editando, setEditando] = useState(null)

  // ---------- GET inicial: useEffect + fetch + AbortController ----------
  useEffect(() => {
    const controller = new AbortController()

    async function carregarAvisos() {
      try {
        setCarregando(true)
        setErro('')

        const response = await fetch(`${API_URL}?_limit=15`, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setAvisos(data)
      } catch (error) {
        // Se foi cancelado (AbortError), não mostramos erro ao usuário
        if (error.name === 'AbortError') {
          return
        }
        setErro('Não foi possível conectar à API.')
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false)
        }
      }
    }

    carregarAvisos()

    // Cleanup: cancela o GET se o componente for desmontado
    return () => controller.abort()
  }, [])

  // ---------- POST ----------
  async function publicarAviso(dados) {
    setErroOperacao('')
    setEnviando(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1,
          title: dados.title,
          body: dados.body
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      // A API sempre devolve id 101, então geramos um id local
      // para que o "key" da lista não se repita.
      const novoAviso = { ...data, id: Date.now() }

      setAvisos(prev => [novoAviso, ...prev])
      return true
    } catch (error) {
      setErroOperacao(`Não foi possível publicar o aviso. (${error.message})`)
      return false
    } finally {
      setEnviando(false)
    }
  }

  // ---------- PUT ----------
  async function atualizarAviso(id, dados) {
    setErroOperacao('')
    setEnviando(true)

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1,
          title: dados.title,
          body: dados.body
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const atualizado = await response.json()

      // map: troca só o aviso com o mesmo id, os outros ficam iguais
      setAvisos(prev =>
        prev.map(aviso => (aviso.id === atualizado.id ? atualizado : aviso))
      )

      setEditando(null)
      return true
    } catch (error) {
      setErroOperacao(`Não foi possível salvar as alterações. (${error.message})`)
      return false
    } finally {
      setEnviando(false)
    }
  }

  // ---------- DELETE com rollback (exclusão otimista) ----------
  async function excluirAviso(id) {
    const anterior = avisos // guarda a lista antes de remover

    setErroOperacao('')
    setExcluindo(true)

    // filter: remove da tela imediatamente
    setAvisos(prev => prev.filter(aviso => aviso.id !== id))

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      // DELETE não tem body de resposta que nos interesse,
      // então só verificamos response.ok (sem response.json()).
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Se o aviso excluído estava em edição, sai do modo edição
      if (editando && editando.id === id) {
        setEditando(null)
      }
    } catch (error) {
      // Rollback: devolve a lista como estava
      setAvisos(anterior)
      setErroOperacao(
        `Não foi possível excluir o aviso. Ele voltou para a lista. (${error.message})`
      )
    } finally {
      setExcluindo(false)
    }
  }

  // ---------- Controle de edição ----------
  function iniciarEdicao(id) {
    // find: encontra o aviso específico pelo id
    const aviso = avisos.find(a => a.id === id)
    setErroOperacao('')
    setEditando(aviso)
  }

  function cancelarEdicao() {
    // Não chama a API: só limpa o estado
    setEditando(null)
  }

  const ocupado = enviando || excluindo

  return (
    <div className="app">
      <header className="cabecalho">
        <h1>Mural de Avisos</h1>
      </header>

      <main className="conteudo">
        <section className="coluna-formulario">
          <FormularioAviso
            editando={editando}
            enviando={enviando}
            onPublicar={publicarAviso}
            onAtualizar={atualizarAviso}
            onCancelar={cancelarEdicao}
          />
        </section>

        <section className="coluna-lista">
          <h2>Avisos</h2>

          {erroOperacao && <p className="mensagem erro">{erroOperacao}</p>}
          {excluindo && <p className="mensagem info">Excluindo...</p>}

          {carregando && <p className="mensagem info">Carregando avisos...</p>}

          {!carregando && erro && <p className="mensagem erro">{erro}</p>}

          {!carregando && !erro && avisos.length === 0 && (
            <p className="mensagem vazio">
              Nenhum aviso publicado — seja a primeira pessoa a escrever no mural.
            </p>
          )}

          {!carregando && !erro && avisos.length > 0 && (
            <ListaAvisos
              avisos={avisos}
              ocupado={ocupado}
              onEditar={iniciarEdicao}
              onExcluir={excluirAviso}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App