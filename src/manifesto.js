const { limpar } = require('./parametros')

class Manifesto {
constructor(mapa) {
this.mapa = mapa
}

static de(dados) {
const lista = Array.isArray(dados) ? dados : (dados?.rotas || dados?.routes || [])
const mapa = new Map()

for(const item of lista) {
const rota = limpar(typeof item === 'string' ? item : (item.rota || `${item.categoria}/${item.nome}`))
if(!rota.includes('/')) continue
const base = typeof item === 'string' ? {} : item
mapa.set(rota, { ...base, rota, params: base.params || [], obrigatorios: base.obrigatorios || [] })
}

return mapa.size ? new Manifesto(mapa) : null
}

info(rota) {
return this.mapa.get(limpar(rota)) || null
}

todas() {
return [...this.mapa.values()].sort((a, b) => a.rota.localeCompare(b.rota))
}

categorias() {
const grupos = {}

for(const rota of this.mapa.keys()) {
const [categoria, ...resto] = rota.split('/')
;(grupos[categoria] ||= []).push(resto.join('/'))
}

return grupos
}
}

module.exports = Manifesto
