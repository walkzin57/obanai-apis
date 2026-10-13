const Obanai = require('./src/cliente')
const Manifesto = require('./src/manifesto')
const { pedir } = require('./src/http')
const { ler, falha } = require('./src/resposta')

module.exports = Obanai
module.exports.Obanai = Obanai
module.exports.default = Obanai
module.exports.Manifesto = Manifesto
module.exports.pedir = pedir
module.exports.ler = ler
module.exports.falha = falha
