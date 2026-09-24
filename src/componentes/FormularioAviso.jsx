import { useState, useEffect } from 'react'

function FormularioAviso({ editando, enviando, onPublicar, onAtualizar, onCancelar }) {
  // Formulário controlado com um único objeto
  const [form, setForm] = useState({
    title: '',
    body: ''
  })
  const [erroForm, setErroForm] = useState('')

  // Quando entra ou sai do modo edição, preenche ou limpa o formulário
  useEffect(() => {
    if (editando) {
      setForm({ title: editando.title, body: editando.body })
    } else {
      setForm({ title: '', body: '' })
    }
    setErroForm('')
  }, [editando])

  // onChange genérico: usa o "name" do input como chave
  function handleChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault() // evita recarregar a página

    // Validação: NÃO faz fetch e mantém os dados digitados
    if (form.title.trim() === '' || form.body.trim() === '') {
      setErroForm('Preencha o título e o texto antes de publicar.')
      return
    }

    setErroForm('')

    const dados = {
      title: form.title.trim(),
      body: form.body.trim()
    }

    let sucesso

    if (editando) {
      sucesso = await onAtualizar(editando.id, dados)
    } else {
      sucesso = await onPublicar(dados)
    }

    // Só limpa se deu certo; se deu erro, os campos continuam preenchidos
    if (sucesso) {
      setForm({ title: '', body: '' })
    }
  }

  function handleCancelar() {
    setForm({ title: '', body: '' })
    setErroForm('')
    onCancelar()
  }

  let textoBotao = 'Publicar aviso'
  if (editando) textoBotao = 'Salvar alterações'
  if (enviando) textoBotao = editando ? 'Salvando...' : 'Publicando...'

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>{editando ? 'Editar aviso' : 'Novo aviso'}</h2>

      <label htmlFor="title">Título</label>
      <input
        id="title"
        name="title"
        type="text"
        value={form.title}
        onChange={handleChange}
        disabled={enviando}
      />

      <label htmlFor="body">Texto</label>
      <textarea
        id="body"
        name="body"
        rows="6"
        value={form.body}
        onChange={handleChange}
        disabled={enviando}
      />

      {erroForm && <p className="mensagem erro">{erroForm}</p>}

      <div className="botoes">
        <button type="submit" disabled={enviando}>
          {textoBotao}
        </button>

        {editando && (
          <button
            type="button"
            className="secundario"
            onClick={handleCancelar}
            disabled={enviando}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioAviso