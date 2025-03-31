import fs from 'fs'

import sources from './src/Experience/sources.js'

const distPath = './dist'
const staticPath = './static'

sources.forEach( source => {
    if ( source.obfuscate === true ) {
        fs.unlink(distPath + source.path, (err) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('File deleted:', source.path)
        })

        // fs.unlink(staticPath + source.path.replace(/\.[^/.]+$/i, '.bin'), (err) => {
        //     if (err) {
        //         console.error(err)
        //         return
        //     }
        //     console.log('File deleted:', source.path)
        // })
    }
})
