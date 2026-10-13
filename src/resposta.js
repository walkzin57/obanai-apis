function falha(status, erro) {
return { ok: false, status, tipo: 'erro', dados: null, bruto: null, buffer: null, mimetype: '', erro }
}

function pegarErro(bruto, status) {
return bruto?.error || bruto?.message || bruto?.msg || bruto?.erro || `HTTP ${status}`
}

async function ler(res) {
const tipo = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()

if(tipo.includes('json')) {
const bruto = await res.json().catch(() => null)
const falhou = !res.ok || bruto?.status === false || bruto?.success === false
const dados = bruto && typeof bruto === 'object' && 'data' in bruto ? bruto.data : bruto
return { ok: !falhou, status: res.status, tipo: 'json', dados, bruto, buffer: null, mimetype: tipo, erro: falhou ? pegarErro(bruto, res.status) : null }
}

if(!res.ok) return falha(res.status, `HTTP ${res.status}`)

if(tipo.startsWith('text/')) {
const texto = await res.text()
return { ok: true, status: res.status, tipo: 'texto', dados: texto, bruto: texto, buffer: null, mimetype: tipo, erro: null }
}

const buffer = Buffer.from(await res.arrayBuffer())
return { ok: true, status: res.status, tipo: 'midia', dados: null, bruto: null, buffer, mimetype: tipo || 'application/octet-stream', erro: null }
}

module.exports = { falha, ler }
