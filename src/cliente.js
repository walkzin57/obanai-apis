const C = require('./constantes')
const { pedir } = require('./http')
const { falha } = require('./resposta')
const { limpar, montarQuery, resolver, faltando } = require('./parametros')
const Manifesto = require('./manifesto')

class Obanai {
constructor({ token = '', base = C.BASE, timeout = C.TIMEOUT, tentativas = C.TENTATIVAS, manifesto = C.MANIFESTO, manifestoComToken = false } = {}) {
if(token && typeof token !== 'string') throw new Error('Obanai: token inválido')
this.token = token
this.base = base.replace(/\/+$/, '')
this.timeout = timeout
this.tentativas = tentativas
this.manifesto = manifesto
this.manifestoComToken = manifestoComToken
this.lista = null

return new Proxy(this, {
get: (alvo, nome) => {
if(typeof nome === 'symbol' || nome === 'then' || nome in alvo) return alvo[nome]
return new Proxy({}, {
get: (_, rota) => {
if(typeof rota === 'symbol' || rota === 'then') return undefined
return arg => alvo.chamar(`${nome}/${rota}`, arg)
}
})
}
})
}

trocarToken(token) {
if(!token || typeof token !== 'string') throw new Error('Obanai: token inválido')
this.token = token
}

async chamar(caminho, arg) {
const rota = limpar(caminho)

if(!this.token) return falha(401, 'Informe o token para chamar rotas')

const info = this.lista?.info(rota)
if(this.lista && !info) return falha(404, `Rota inexistente: ${rota}`)

const params = resolver(arg, info)
const ausentes = faltando(params, info)
if(ausentes.length) return falha(400, `Parâmetro obrigatório: ${ausentes.join(', ')}`)

return pedir(`${this.base}/api/${rota}?${montarQuery(params, this.token)}`, this)
}

async rotas() {
const query = this.manifestoComToken ? montarQuery({}, this.token) : ''
const res = await pedir(`${this.base}${this.manifesto}${query ? `?${query}` : ''}`, this)
if(!res.ok || res.tipo !== 'json') return res

const lista = Manifesto.de(res.dados)
if(lista) this.lista = lista

return { ...res, dados: this.lista ? this.lista.todas() : [] }
}

info(rota) {
return this.lista?.info(rota) || null
}

categorias() {
return this.lista?.categorias() || {}
}
}

module.exports = Obanai
