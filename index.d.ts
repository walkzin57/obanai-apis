export interface ObanaiOpcoes {
token?: string
base?: string
timeout?: number
tentativas?: number
manifesto?: string
manifestoComToken?: boolean
}

export interface Resposta<T = any> {
ok: boolean
status: number
tipo: 'json' | 'midia' | 'texto' | 'erro'
dados: T | null
bruto: any
buffer: Buffer | null
mimetype: string
erro: string | null
}

export interface InfoRota {
rota: string
metodo?: string
params: string[]
obrigatorios: string[]
resposta?: 'json' | 'midia' | 'misto'
[chave: string]: any
}

export type Entrada = string | number | Record<string, any>
export type Rota = (entrada?: Entrada) => Promise<Resposta>

export class Obanai {
constructor(opcoes?: ObanaiOpcoes)
token: string
trocarToken(token: string): void
chamar(caminho: string, entrada?: Entrada): Promise<Resposta>
rotas(): Promise<Resposta<InfoRota[]>>
info(rota: string): InfoRota | null
categorias(): Record<string, string[]>
[categoria: string]: any
}

export class Manifesto {
static de(dados: unknown): Manifesto | null
info(rota: string): InfoRota | null
todas(): InfoRota[]
categorias(): Record<string, string[]>
}

export default Obanai
