# obanai-apis

Cliente simples pra usar a Obanai APIs no Node. Sem dependências, sem configuração chata: instala, coloca a chave e chama.

Feito pra bot de WhatsApp, mas funciona em qualquer projeto Node.

## Instalar

```bash
npm i obanai-apis
```

Precisa de Node 18 ou mais novo. Funciona no Termux também, já que não compila nada.

## Começando

```js
const Obanai = require('obanai-apis')

const api = new Obanai({ token: 'SUA_CHAVE' })

const r = await api.stalk.github('torvalds')

if (!r.ok) return console.log(r.erro)
console.log(r.dados)
```

Sua chave você pega em https://obanai-apis.eu.cc. Não deixe ela fixa no código se for subir pro GitHub, use uma variável de ambiente:

```js
const api = new Obanai({ token: process.env.OBANAI_TOKEN })
```

## Como as chamadas funcionam

`api.categoria.rota()` vira `GET /api/categoria/rota`. Não existe lista de métodos escrita no código: qualquer rota nova que você criar na API já funciona no SDK sem atualizar nada.

```js
await api.outros.clima('Fortaleza') // GET /api/outros/clima?q=Fortaleza
await api.outros.cep('01001000') // GET /api/outros/cep?cep=01001000
await api.noticias.g1() // GET /api/noticias/g1
```

Quando você passa só um texto, ele vai no parâmetro principal da rota. Qual é o principal depende da rota: no `clima` é `q`, no `cep` é `cep`. O SDK descobre isso sozinho depois de chamar `api.rotas()` (mais abaixo). Sem isso ele assume `q`.

## Rotas com mais de um parâmetro

Passe um objeto. Cada chave vira um parâmetro da query:

```js
await api.ias.gpt({ q: 'me explica o que é uma API', locale: 'pt' })

await api.logos.avengers({ text: 'Obanai', text2: 'APIs' })

await api.canvas.bemvindo({
  grupo: 'Meu grupo',
  usuario: 'Fulano',
  perfil: 'https://...',
  fundo: 'https://...'
})
```

## Rotas com hífen no nome

JavaScript não deixa escrever hífen direto, então use colchetes ou o `chamar`:

```js
await api.stalk['roblox-stalk']('Roblox')

await api.chamar('stalk/roblox-stalk', 'Roblox')
```

O `chamar` recebe o caminho completo e é útil quando a rota vem de uma variável.

## O que volta

Toda chamada devolve o mesmo formato e nunca dá throw, seja erro de rede, token errado ou rota fora do ar:

```js
{
  ok, // true se deu certo
  status, // código HTTP (0 se nem chegou no servidor)
  tipo, // 'json', 'midia', 'texto' ou 'erro'
  dados, // conteúdo de "data" quando a rota usa, senão o JSON inteiro
  bruto, // o JSON exatamente como o servidor mandou
  buffer, // o arquivo, quando a rota devolve imagem, áudio ou vídeo
  mimetype, // ex: 'image/png'
  erro // mensagem de erro, ou null
}
```

Por isso o uso é sempre o mesmo: testa `r.ok`, se falhou o motivo tá em `r.erro`, se deu certo pega `r.dados` ou `r.buffer`.

## Imagens, áudios e vídeos

Rotas de logo, figurinha, QR code e canvas devolvem o arquivo pronto. Ele vem em `buffer` com o `mimetype` certo:

```js
const r = await api.tools.qrcode({ texto: 'https://obanai-apis.eu.cc' })

if (!r.ok) return console.log(r.erro)

await bot.message.send(from, {
  type: 'image',
  media: r.buffer,
  mimetype: r.mimetype
})
```

Se você usa Zapo, lembre que o `mimetype` é obrigatório no envio de imagem, e o SDK já entrega ele pronto.

Algumas rotas podem devolver JSON em vez de imagem quando algo dá errado. Olhe o `r.tipo` se quiser tratar os dois casos.

## Usando no bot

Exemplo dentro de um `switch(command)`:

```js
case 'clima': {
  if (!q) return responder('Use: !clima cidade')

  const r = await api.outros.clima(q)
  if (!r.ok) return reply(r.erro)

  await reply(JSON.stringify(r.dados, null, 2))
  break
}

case 'logo': {
  const r = await api.logos.areia({ text: q || 'Obanai' })
  if (!r.ok) return responder(r.erro)

  await bot.message.send(from, {
    type: 'image',
    media: r.buffer,
    mimetype: r.mimetype
  }, { quote: info })
  break
}
```

Crie o `api` uma vez só, no começo do arquivo de conexão, e reaproveite em todos os comandos.

## Lista de rotas

```js
await api.rotas()
```

Essa chamada não precisa de token e não envia a chave. Ela baixa a lista de rotas da API junto com os parâmetros de cada uma. Depois disso o SDK passa a:

- usar o parâmetro principal certo quando você passa só um texto;
- recusar rota que não existe, na hora, sem gastar request;
- avisar parâmetro obrigatório que você esqueceu, também sem gastar request.

```js
api.info('dl/ytmp3')
// { rota: 'dl/ytmp3', params: ['url'], obrigatorios: ['url'], ... }

api.categorias()
// { dl: ['audiomeme', 'facebook', ...], logos: [...], ... }
```

Chame `api.rotas()` uma vez ao iniciar o bot. Se a API cair nessa hora, nada quebra: o SDK só continua sem a validação.

## Erros que o próprio SDK devolve

Antes de gastar request, o SDK já barra alguns casos:

| status | quando acontece |
| --- | --- |
| 401 | chamou uma rota sem ter informado o token |
| 400 | faltou um parâmetro obrigatório (só depois do `api.rotas()`) |
| 404 | a rota não existe (só depois do `api.rotas()`) |
| 0 | não deu pra falar com o servidor (internet, timeout, API fora) |

Qualquer outro código vem direto do servidor, e a mensagem de `r.erro` é a que a API mandou.

## Opções

```js
const api = new Obanai({
  token: '', // sem token só dá pra usar api.rotas()
  base: 'https://obanai-apis.eu.cc', // útil se você hospedar a sua própria
  timeout: 30000, // em milissegundos
  tentativas: 1, // quantas vezes tenta de novo se o servidor der erro 500
  manifesto: '/api/rotas', // caminho da lista de rotas
  manifestoComToken: false // true se a lista passar a exigir token
})
```

Pra trocar a chave sem criar outro cliente:

```js
api.trocarToken('NOVA_CHAVE')
```

## Principais categorias

`dl` para downloads, `search` para pesquisas, `ias` para inteligências artificiais, `stalk` para consultas de perfil, `tools` para ferramentas, `sticker` para figurinhas, `logos` para logos, `canvas` para imagens de boas-vindas, perfil e rank, `noticias`, `plaq`, `outros` e `random`.

Pra ver tudo que está disponível agora, rode `api.categorias()` depois do `api.rotas()`.

## TypeScript

O pacote já vem com tipos (`index.d.ts`), então o editor completa `r.ok`, `r.dados` e o resto sem você configurar nada.

---

Criador +𝟕𝟑 | 𝚂𝚁. 𝐀𝐧֟፝𝐨̷𝐧𝐢𝐦𝐨̷.𝐣𝐬 </>