function limpar(rota) {
return String(rota).replace(/^\/+|\/+$/g, '').replace(/^api\//, '')
}

function montarQuery(params, token) {
const query = new URLSearchParams()

for(const [chave, valor] of Object.entries(params)) {
if(valor !== undefined && valor !== null) query.set(chave, String(valor))
}

if(token) query.set('apitoken', token)
return query.toString()
}

function resolver(arg, info) {
if(arg && typeof arg === 'object') return arg
if(arg === undefined || arg === null) return {}
return { [info?.params?.[0] || 'q']: arg }
}

function faltando(params, info) {
return (info?.obrigatorios || []).filter(p => params[p] === undefined || params[p] === null || params[p] === '')
}

module.exports = { limpar, montarQuery, resolver, faltando }
