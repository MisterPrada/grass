import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import Terminal from 'vite-plugin-terminal'
//import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";


const dirname = path.resolve()

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default ({ mode }) => ({
    root: 'src/',
    publicDir: '../static/',
    base: './',
    resolve:
        {
            alias:
                {
                    '@experience' : path.resolve(dirname, './src/Experience/'),
                }
        },
    server:
    {
        host: true,
        open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: mode !== 'production'
    },
    plugins:
    [
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        glsl(),
        basicSsl(),
        // Terminal({
        //     console: 'terminal',
        //     output: ['terminal', 'console']
        // })
        // obfuscatorPlugin({
        //     options: {
        //         //include: ["src/path/to/file.js", "path/anyjs/**/*.js", /foo.js$/],
        //         exclude: [/node_modules/],
        //         apply: "build",
        //         debugger: true,
        //         // your javascript-obfuscator options
        //         debugProtection: true,
        //         // ...  [See more options](https://github.com/javascript-obfuscator/javascript-obfuscator)
        //     },
        // }),
    ]
})
