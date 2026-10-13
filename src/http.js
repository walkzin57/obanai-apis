const { falha, ler } = require('./resposta')

async function pedir(url, { timeout, tentativas }) {
let erro = null

for(let i = 0; i <= tentativas; i++) {
try {
const res = await fetch(url, { signal: AbortSignal.timeout(timeout) })
if(res.status >= 500 && i < tentativas) continue
return await ler(res)
} catch(e) {
erro = e
}
}

return falha(0, erro?.message || 'falha de rede')
}

module.exports = { pedir }
