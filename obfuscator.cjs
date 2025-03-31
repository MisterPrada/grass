// https://github.com/javascript-obfuscator/javascript-obfuscator
// Prototype code (need update only use on src and check performance)

const fs = require('fs')
const JavaScriptObfuscator = require('javascript-obfuscator');

const assetsPath = './dist/assets'

// get js files from assetsPath
const jsFiles = fs.readdirSync(assetsPath).filter(file => {
    if( file.endsWith('.js') === true ) {
        // obfuscate this file
        const filePath = `${assetsPath}/${file}`
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const obfuscationResult = JavaScriptObfuscator.obfuscate(fileContent, {
            stringArrayEncoding: ['rc4'],
            stringArrayThreshold: 1,  // obfuscate all strings
            controlFlowFlattening: true, // Set to true to enable control flow flattening
            deadCodeInjection: true, // Set to true to inject code into dead code paths
            renameGlobals: true, // Set to true to enable obfuscation of global variable and function names
        });

        // write obfuscated file to distPath
        fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf8')
    }
})

