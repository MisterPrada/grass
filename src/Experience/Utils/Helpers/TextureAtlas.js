import * as THREE from 'three/webgpu'

function _GetImageData( image ) {
    const canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext( '2d' );
    context.translate( 0, image.height );
    context.scale( 1, -1 );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );
}

class TextureAtlas {
    constructor() {
        this.create_();
        this.onLoad = () => {
        };
    }

    Load( atlas, names ) {
        this.loadAtlas_( atlas, names );
    }

    create_() {
        // this.manager_ = new THREE.LoadingManager();
        // this.loader_ = new THREE.TextureLoader( this.manager_ );
        this.textures_ = {};
        //
        // this.manager_.onLoad = () => {
        //     this.onLoad_();
        // };
    }

    get Info() {
        return this.textures_;
    }

    onLoad_() {
        for ( let k in this.textures_ ) {
            let X = null;
            let Y = null;
            const atlas = this.textures_[ k ];
            let data = null;

            for ( let t = 0; t < atlas.textures.length; t++ ) {
                const loader = atlas.textures[ t ];
                const curData = loader();

                const h = curData.height;
                const w = curData.width;

                if ( X === null ) {
                    X = w;
                    Y = h;
                    data = new Uint8Array( atlas.textures.length * 4 * X * Y );
                }

                if ( w !== X || h !== Y ) {
                    console.error( 'Texture dimensions do not match' );
                    return;
                }
                const offset = t * ( 4 * w * h );

                data.set( curData.data, offset );
            }

            const diffuse = new THREE.DataArrayTexture( data, X, Y, atlas.textures.length );
            //diffuse.colorSpace = THREE.SRGBColorSpace
            diffuse.format = THREE.RGBAFormat;
            diffuse.type = THREE.UnsignedByteType;
            diffuse.minFilter = THREE.LinearMipMapLinearFilter;
            diffuse.magFilter = THREE.LinearFilter;
            diffuse.wrapS = THREE.ClampToEdgeWrapping;
            diffuse.wrapT = THREE.ClampToEdgeWrapping;
            // diffuse.wrapS = THREE.RepeatWrapping;
            // diffuse.wrapT = THREE.RepeatWrapping;
            diffuse.generateMipmaps = true;
            diffuse.needsUpdate = true;

            atlas.atlas = diffuse;
        }

        this.onLoad();
    }

    loadType_( t ) {

        if ( t.isTexture ) {
            return () => {
                return _GetImageData( t.image );
            };
        } else {
            console.error( 'TextureAtlas: Unsupported texture type' );
        }

        // if ( typeof ( t ) == 'string' ) {
        //     const texture = this.loader_.load( t );
        //     return () => {
        //         return _GetImageData( texture.image );
        //     };
        // } else {
        //     return () => {
        //         return t;
        //     };
        // }
    }

    loadAtlas_( atlas, names ) {
        this.textures_[ atlas ] = {
            textures: names.map( n => this.loadType_( n ) )
        };

        this.onLoad_();
    }
}

export {
    TextureAtlas
}
