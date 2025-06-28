#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

// Configuración
const BRANCH = 'middle_cascading';
const REMOTE = 'origin';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Función para mostrar mensajes con colores
function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// Función para ejecutar comandos
function runCommand(command, description) {
    try {
        log(`\n${description}...`, 'cyan');
        log(`> ${command}`, 'yellow');
        
        const output = execSync(command, { 
            encoding: 'utf8',
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        if (output.trim()) {
            console.log(output);
        }
        
        log(`✓ ${description} completado`, 'green');
        return true;
    } catch (error) {
        log(`✗ Error en: ${description}`, 'red');
        log(error.message, 'red');
        return false;
    }
}

// Función para obtener input del usuario
function getCommitMessage() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        log('\n📝 Ingresa el mensaje del commit:', 'magenta');
            rl.question('Commit message: ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Función principal
async function main() {
    try {
            log('🚀 Iniciando proceso Git automatizado', 'bright');
            log(`Rama destino: ${BRANCH}`, 'blue');
        
        // 1. Git Status
        if (!runCommand('git status', 'Verificando estado del repositorio')) {
            process.exit(1);
        }

        // 2. Git Add
        if (!runCommand('git add .', 'Agregando archivos al stage')) {
            process.exit(1);
        }

        // 3. Obtener mensaje de commit
        const commitMessage = await getCommitMessage();
        
        if (!commitMessage) {
            log('❌ Mensaje de commit vacío. Operación cancelada.', 'red');
            process.exit(1);
        }

        // 4. Git Commit
        const commitCommand = `git commit -m "${commitMessage}"`;
        if (!runCommand(commitCommand, 'Creando commit')) {
            process.exit(1);
        }

        // 5. Git Push
        const pushCommand = `git push ${REMOTE} ${BRANCH}`;
        if (!runCommand(pushCommand, `Subiendo cambios a ${REMOTE}/${BRANCH}`)) {
            process.exit(1);
        }

        log('\n🎉 ¡Proceso completado exitosamente!', 'green');
        log(`Cambios subidos a: ${REMOTE}/${BRANCH}`, 'blue');

    } catch (error) {
        log(`\n❌ Error inesperado: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Ejecutar script
main();