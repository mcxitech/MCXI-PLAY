// Sets the production admin password without ever storing or printing it.
// Usage: npm run admin:password
// Asks for the password (hidden), hashes it with SHA-256 and uploads only the hash
// as the ADMIN_PASSWORD_HASH secret of the deployed Worker.
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import readline from 'node:readline'

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => { if (s.startsWith(question)) rl.output.write(s); else if (s !== '\r\n' && s !== '\n') rl.output.write('*') }
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer) })
  })
}

const password = await askHidden('Nueva contraseña de admin (mín. 12 caracteres): ')
if (password.length < 12) {
  console.error('Muy corta. Usa al menos 12 caracteres.')
  process.exit(1)
}
const confirm = await askHidden('Repite la contraseña: ')
if (confirm !== password) {
  console.error('No coinciden. No se cambió nada.')
  process.exit(1)
}

const hash = createHash('sha256').update(password).digest('hex')
const child = spawn('npx', ['wrangler', 'secret', 'put', 'ADMIN_PASSWORD_HASH'], { stdio: ['pipe', 'inherit', 'inherit'], shell: true })
child.stdin.end(hash)
child.on('exit', (code) => {
  if (code === 0) console.log('Listo. Entra en /admin/login con tu nueva contraseña.')
  process.exit(code ?? 1)
})
