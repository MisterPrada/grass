import * as THREE from 'three'
import fs from 'fs'

import sources from './src/Experience/sources.js'
const metaOffset = 8
const mask = 0xAA

const distPath = './dist'

console.log('--- Encoder Start ---')

sources.forEach( source => {
    if ( source.obfuscate === true ) {

        console.log(distPath + source.path)
        // Read file
        fs.readFile(distPath + source.path, (err, data) => {
            if (err) throw err;

            // Convert Buffer to ArrayBuffer
            const modelArrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);


            const encoder = new TextEncoder();
            const metadataString = JSON.stringify( source );
            const metadataBuffer = encoder.encode( metadataString );

            //console.log( 'metadataString', metadataString )
            //console.log( 'metadataBuffer', metadataBuffer )

            const meta_uint32Number = BigInt( metadataBuffer.byteLength )
            //console.log( 'meta_uint32Number', meta_uint32Number )

            // Calculate total size of the new `ArrayBuffer`
            const totalSize = metaOffset + metadataBuffer.byteLength + modelArrayBuffer.byteLength;
            const arrayBuffer = new ArrayBuffer( totalSize );

            //console.log( 'metadataBuffer.byteLength', metadataBuffer.byteLength )
            //console.log( 'totalSize', totalSize )

            // Create a `DataView` to write the metadata length
            const dataView = new DataView( arrayBuffer );

            // Write the metadata length as a 32-bit unsigned integer
            dataView.setBigUint64( 0, meta_uint32Number, true );


            // Copy the metadata to the new `ArrayBuffer` after the metadata length
            new Uint8Array( arrayBuffer, metaOffset, metadataBuffer.byteLength ).set( metadataBuffer );

            // Copy the model to the new `ArrayBuffer` after the metadata
            new Uint8Array( arrayBuffer, metaOffset + metadataBuffer.byteLength ).set( new Uint8Array( modelArrayBuffer ) );


            //console.log( 'arrayBuffer', arrayBuffer )

            const uint8Array = new Uint8Array(arrayBuffer);

            /* OBFUSCATE */
            for (let i = 0; i < uint8Array.length; i++) {
                uint8Array[i] ^= mask;
            }

            // Write to new file model.bin
            const filePath = source.path.replace(/\.[^/.]+$/i, '.bin')

            fs.writeFile(distPath + filePath, uint8Array, (err) => {
                if (err) throw err;
                console.log(filePath);
            })
        });
    }
})
