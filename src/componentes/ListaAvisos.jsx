import CartaoAviso from './CartaoAviso'

function ListaAvisos({ avisos, ocupado, onEditar, onExcluir }) {
  return (
    <div className="lista">
      {/* map: transforma cada objeto do array em um cartão */}
      {avisos.map(aviso => (
        <CartaoAviso
          key={aviso.id}
          aviso={aviso}
          ocupado={ocupado}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  )
}

export default ListaAvisos