function CartaoAviso({ aviso, ocupado, onEditar, onExcluir }) {
  return (
    <article className="cartao">
      <h3>{aviso.title}</h3>
      <p>{aviso.body}</p>

      <small>
        ID: {aviso.id} · Autor: {aviso.userId}
      </small>

      <div className="botoes">
        <button onClick={() => onEditar(aviso.id)} disabled={ocupado}>
          Editar
        </button>
        <button
          className="perigo"
          onClick={() => onExcluir(aviso.id)}
          disabled={ocupado}
        >
          Excluir
        </button>
      </div>
    </article>
  )
}

export default CartaoAviso