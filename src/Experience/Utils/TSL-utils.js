import {
    float, vec2, vec3, cos, sin, Fn, normalize, max, color,
    length, smoothstep, Loop, int, uvec2, uint, mat3, sub, mul, fract, dot, mix,
    floor, bitcast, pow, saturate, add, reflect
} from 'three/tsl';

bitcast.setParameterLength( 1 );

const rotateY = /*#__PURE__*/ Fn( ( [ theta_immutable ] ) => {

    const theta = float( theta_immutable ).toVar();
    const c = float( cos( theta ) ).toVar();
    const s = float( sin( theta ) ).toVar();

    return mat3( vec3( c, int( 0 ), s ), vec3( int( 0 ), int( 1 ), int( 0 ) ), vec3( s.negate(), int( 0 ), c ) );

} ).setLayout( {
    name: 'rotateY',
    type: 'mat3',
    inputs: [
        { name: 'theta', type: 'float' }
    ]
} );

const rotateZ = /*#__PURE__*/ Fn( ( [ v_immutable, angle_immutable ] ) => {

    const angle = float( angle_immutable ).toVar();
    const v = vec3( v_immutable ).toVar();
    const cosAngle = float( cos( angle ) ).toVar();
    const sinAngle = float( sin( angle ) ).toVar();

    return vec3( v.x.mul( cosAngle ).sub( v.y.mul( sinAngle ) ), v.x.mul( sinAngle ).add( v.y.mul( cosAngle ) ), v.z );

} ).setLayout( {
    name: 'rotateZ',
    type: 'vec3',
    inputs: [
        { name: 'v', type: 'vec3' },
        { name: 'angle', type: 'float' }
    ]
} );


const facture = Fn( ( [ vector_immutable ] ) => {

    const vector = vec3( vector_immutable ).toVar();
    const normalizedVector = vec3( normalize( vector ) ).toVar();

    return max( max( normalizedVector.x, normalizedVector.y ), normalizedVector.z );

} ).setLayout( {
    name: 'facture',
    type: 'float',
    inputs: [
        { name: 'vector', type: 'vec3' }
    ]
} );

const emission = Fn( ( [ color_immutable, strength_immutable ] ) => {

    const strength = float( strength_immutable ).toVar();
    const color = vec3( color_immutable ).toVar();

    return color.mul( strength );

} ).setLayout( {
    name: 'emission',
    type: 'vec3',
    inputs: [
        { name: 'color', type: 'vec3' },
        { name: 'strength', type: 'float' }
    ]
} );


const directionalBlur = /*#__PURE__*/ Fn( ( [ uv_immutable, direction_immutable, radius_immutable ] ) => {

    const radius = float( radius_immutable ).toVar();
    const direction = vec2( direction_immutable ).toVar();
    const uv = vec2( uv_immutable ).toVar();
    const sum = float( 0.0 ).toVar();
    const total = float( 0.0 ).toVar();

    Loop( { start: int( radius.negate() ), end: int( radius ), type: 'int', condition: '<=' }, ( { i } ) => {
        const offset = vec2( uv.add( direction.mul( i ).div( radius ) ) ).toVar();
        const dist = float( length( offset.sub( vec2( 0.5, 0.5 ) ) ) ).toVar();
        const circle = float( smoothstep( 0.4, 0.5, dist ) ).toVar();
        sum.addAssign( circle );
        total.addAssign( 1.0 );
    } );

    return sum.div( total );

} ).setLayout( {
    name: 'directionalBlur',
    type: 'float',
    inputs: [
        { name: 'uv', type: 'vec2' },
        { name: 'direction', type: 'vec2' },
        { name: 'radius', type: 'float' }
    ]
} );

const scaleWithCenter = /*#__PURE__*/ Fn( ( [ uv_immutable, scale_immutable, center_immutable ] ) => {

    const center = vec2( center_immutable ).toVar();
    const scale = vec2( scale_immutable ).toVar();
    const uv = vec2( uv_immutable ).toVar();

    return center.add( uv.sub( center ).mul( scale ) );

} ).setLayout( {
    name: 'scaleWithCenter',
    type: 'vec2',
    inputs: [
        { name: 'uv', type: 'vec2' },
        { name: 'scale', type: 'vec2' },
        { name: 'center', type: 'vec2' }
    ]
} );

const murmurHash21 = /*#__PURE__*/ Fn( ( [ src_immutable ] ) => {

    const src = uint( src_immutable ).toVar();
    const M = uint( int( 0x5bd1e995 ) );
    const h = uvec2( uint( 1190494759 ), uint( 2147483647 ) ).toVar();
    src.mulAssign( M );
    src.bitXorAssign( src.shiftRight( uint( 24 ) ) );
    src.mulAssign( M );
    h.mulAssign( M );
    h.bitXorAssign( src );
    h.bitXorAssign( h.shiftRight( uvec2( uint( 13 ), uint( 13 ) ) ) );
    h.mulAssign( M );
    h.bitXorAssign( h.shiftRight( uvec2( uint( 15 ), uint( 13 ) ) ) );

    return h;

} ).setLayout( {
    name: 'murmurHash21',
    type: 'uvec2',
    inputs: [
        { name: 'src', type: 'uint' }
    ]
} );


// 2 outputs, 1 input
const hash21 = /*#__PURE__*/ Fn( ( [ src_immutable ] ) => {

    const src = float( src_immutable ).toVar();
    const h = uvec2( murmurHash21( bitcast( src ) ) ).toVar();

    const x = bitcast( h.x.bitAnd( int( 0x007fffff ) ).bitOr( int( 0x3f800000 ) ) );
    const y = bitcast( h.y.bitAnd( int( 0x007fffff ) ).bitOr( int( 0x3f800000 ) ) );

    return vec2( x, y ).sub( 1.0 );
    //return float( h.bitAnd( int( 0x007fffff ) ).bitOr( int( 0x3f800000 ) ) ).sub( 1.0 );

} ).setLayout( {
    name: 'hash21',
    type: 'vec2',
    inputs: [
        { name: 'src', type: 'float' }
    ]
} );

// const hash21 = /*#__PURE__*/ Fn( ( [ p_immutable ] ) => {
//
//     const p = float( p_immutable ).toVar();
//     const p3 = vec3( fract( vec3( p ).mul( vec3( .1031, .1030, .0973 ) ) ) ).toVar();
//     p3.addAssign( dot( p3, p3.yzx.add( 33.33 ) ) );
//
//     return fract( p3.xx.add( p3.yz ).mul( p3.zy ) );
//
// } ).setLayout( {
//     name: 'hash21',
//     type: 'vec2',
//     inputs: [
//         { name: 'p', type: 'float' }
//     ]
// } );


const _hash = /*#__PURE__*/ Fn( ( [ p_immutable ] ) => {

    const p = vec3( p_immutable ).toVar();
    p.assign( vec3( dot( p, vec3( 127.1, 311.7, 74.7 ) ), dot( p, vec3( 269.5, 183.3, 246.1 ) ), dot( p, vec3( 113.5, 271.9, 124.6 ) ) ) );

    return float( -1.0 ).add( mul( 2.0, fract( sin( p ).mul( 43758.5453123 ) ) ) );

} ).setLayout( {
    name: 'hash',
    type: 'vec3',
    inputs: [
        { name: 'p', type: 'vec3' }
    ]
} );

const easeOut = /*#__PURE__*/ Fn( ( [ x_immutable, t_immutable ] ) => {

    const t = float( t_immutable ).toVar();
    const x = float( x_immutable ).toVar();

    return sub( 1.0, pow( sub( 1.0, x ), t ) );

} ).setLayout( {
    name: 'easeOut',
    type: 'float',
    inputs: [
        { name: 'x', type: 'float' },
        { name: 't', type: 'float' }
    ]
} );

const rotateAxis = /*#__PURE__*/ Fn( ( [ axis_immutable, angle_immutable ] ) => {

    const angle = float( angle_immutable ).toVar();
    const axis = vec3( axis_immutable ).toVar();
    const s = float( sin( angle ) ).toVar();
    const c = float( cos( angle ) ).toVar();
    const oc = float( sub( 1.0, c ) ).toVar();

    return mat3(
        oc.mul( axis.x ).mul( axis.x ).add( c ),
        oc.mul( axis.x ).mul( axis.y ).sub( axis.z.mul( s ) ),
        oc.mul( axis.z ).mul( axis.x ).add( axis.y.mul( s ) ),
        oc.mul( axis.x ).mul( axis.y ).add( axis.z.mul( s ) ),
        oc.mul( axis.y ).mul( axis.y ).add( c ),
        oc.mul( axis.y ).mul( axis.z ).sub( axis.x.mul( s ) ),
        oc.mul( axis.z ).mul( axis.x ).sub( axis.y.mul( s ) ),
        oc.mul( axis.y ).mul( axis.z ).add( axis.x.mul( s ) ),
        oc.mul( axis.z ).mul( axis.z ).add( c )
    );

} ).setLayout( {
    name: 'rotateAxis',
    type: 'mat3',
    inputs: [
        { name: 'axis', type: 'vec3' },
        { name: 'angle', type: 'float' }
    ]
} );

const bezier = /*#__PURE__*/ Fn( ( [ P0_immutable, P1_immutable, P2_immutable, P3_immutable, t_immutable ] ) => {

    const t = float( t_immutable ).toVar();
    const P3 = vec3( P3_immutable ).toVar();
    const P2 = vec3( P2_immutable ).toVar();
    const P1 = vec3( P1_immutable ).toVar();
    const P0 = vec3( P0_immutable ).toVar();

    return sub( 1.0, t ).mul( sub( 1.0, t ) ).mul( sub( 1.0, t ) ).mul( P0 ).add( mul( 3.0, sub( 1.0, t ) ).mul( sub( 1.0, t ) ).mul( t ).mul( P1 ) ).add( mul( 3.0, sub( 1.0, t ) ).mul( t ).mul( t ).mul( P2 ) ).add( t.mul( t ).mul( t ).mul( P3 ) );

} ).setLayout( {
    name: 'bezier',
    type: 'vec3',
    inputs: [
        { name: 'P0', type: 'vec3' },
        { name: 'P1', type: 'vec3' },
        { name: 'P2', type: 'vec3' },
        { name: 'P3', type: 'vec3' },
        { name: 't', type: 'float' }
    ]
} );

const bezierGrad = /*#__PURE__*/ Fn( ( [ P0_immutable, P1_immutable, P2_immutable, P3_immutable, t_immutable ] ) => {

    const t = float( t_immutable ).toVar();
    const P3 = vec3( P3_immutable ).toVar();
    const P2 = vec3( P2_immutable ).toVar();
    const P1 = vec3( P1_immutable ).toVar();
    const P0 = vec3( P0_immutable ).toVar();

    return mul( 3.0, sub( 1.0, t ) ).mul( sub( 1.0, t ) ).mul( P1.sub( P0 ) ).add( mul( 6.0, sub( 1.0, t ) ).mul( t ).mul( P2.sub( P1 ) ) ).add( mul( 3.0, t ).mul( t ).mul( P3.sub( P2 ) ) );

} ).setLayout( {
    name: 'bezierGrad',
    type: 'vec3',
    inputs: [
        { name: 'P0', type: 'vec3' },
        { name: 'P1', type: 'vec3' },
        { name: 'P2', type: 'vec3' },
        { name: 'P3', type: 'vec3' },
        { name: 't', type: 'float' }
    ]
} );

const noise = /*#__PURE__*/ Fn( ( [ p_immutable ] ) => {

    const p = vec3( p_immutable ).toVar();
    const i = vec3( floor( p ) ).toVar();
    const f = vec3( fract( p ) ).toVar();
    const u = vec3( f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) ) ).toVar();

    return mix( mix( mix( dot( _hash( i.add( vec3( 0.0, 0.0, 0.0 ) ) ),
                    f.sub( vec3( 0.0, 0.0, 0.0 ) ) ),
                dot( _hash( i.add( vec3( 1.0, 0.0, 0.0 ) ) ),
                    f.sub( vec3( 1.0, 0.0, 0.0 ) ) ), u.x ),
            mix( dot( _hash( i.add( vec3( 0.0, 1.0, 0.0 ) ) ),
                    f.sub( vec3( 0.0, 1.0, 0.0 ) ) ),
                dot( _hash( i.add( vec3( 1.0, 1.0, 0.0 ) ) ),
                    f.sub( vec3( 1.0, 1.0, 0.0 ) ) ), u.x ), u.y ),
        mix( mix( dot( _hash( i.add( vec3( 0.0, 0.0, 1.0 ) ) ),
                    f.sub( vec3( 0.0, 0.0, 1.0 ) ) ),
                dot( _hash( i.add( vec3( 1.0, 0.0, 1.0 ) ) ),
                    f.sub( vec3( 1.0, 0.0, 1.0 ) ) ), u.x ),
            mix( dot( _hash( i.add( vec3( 0.0, 1.0, 1.0 ) ) ),
                    f.sub( vec3( 0.0, 1.0, 1.0 ) ) ),
                dot( _hash( i.add( vec3( 1.0, 1.0, 1.0 ) ) ),
                    f.sub( vec3( 1.0, 1.0, 1.0 ) ) ), u.x ), u.y ), u.z );

} ).setLayout( {
    name: 'noise',
    type: 'float',
    inputs: [
        { name: 'p', type: 'vec3', qualifier: 'in' }
    ]
} );

const terrainHeight = /*#__PURE__*/ Fn( ( [ worldPos_immutable ] ) => {

    const worldPos = vec3( worldPos_immutable ).toVar();

    return vec3( worldPos.x, noise( worldPos.mul( 0.02 ) ).mul( 10.0 ), worldPos.z );

} ).setLayout( {
    name: 'terrainHeight',
    type: 'vec3',
    inputs: [
        { name: 'worldPos', type: 'vec3' }
    ]
} );

const lambertLight = /*#__PURE__*/ Fn( ( [ normal_immutable, viewDir_immutable, lightDir_immutable, lightColour_immutable ] ) => {

    const lightColour = vec3( lightColour_immutable ).toVar();
    const lightDir = vec3( lightDir_immutable ).toVar();
    const viewDir = vec3( viewDir_immutable ).toVar();
    const normal = vec3( normal_immutable ).toVar();
    const wrap = float( 0.5 ).toVar();
    const dotNL = float( saturate( dot( normal, lightDir ).add( wrap ).div( add( 1.0, wrap ) ) ) ).toVar();
    const lighting = vec3( dotNL ).toVar();
    const backlight = float( saturate( dot( viewDir, lightDir.negate() ).add( wrap ).div( add( 1.0, wrap ) ) ) ).toVar();
    const scatter = vec3( pow( backlight, 2.0 ) ).toVar();
    lighting.addAssign( scatter );

    return lighting.mul( lightColour );

} ).setLayout( {
    name: 'lambertLight',
    type: 'vec3',
    inputs: [
        { name: 'normal', type: 'vec3' },
        { name: 'viewDir', type: 'vec3' },
        { name: 'lightDir', type: 'vec3' },
        { name: 'lightColour', type: 'vec3' }
    ]
} );

const hemiLight = /*#__PURE__*/ Fn( ( [ normal_immutable, groundColour_immutable, skyColour_immutable ] ) => {

    const skyColour = vec3( skyColour_immutable ).toVar();
    const groundColour = vec3( groundColour_immutable ).toVar();
    const normal = vec3( normal_immutable ).toVar();

    return mix( groundColour, skyColour, mul( 0.5, normal.y ).add( 0.5 ) );

} ).setLayout( {
    name: 'hemiLight',
    type: 'vec3',
    inputs: [
        { name: 'normal', type: 'vec3' },
        { name: 'groundColour', type: 'vec3' },
        { name: 'skyColour', type: 'vec3' }
    ]
} );

const phongSpecular = /*#__PURE__*/ Fn( ( [ normal_immutable, lightDir_immutable, viewDir_immutable ] ) => {

    const viewDir = vec3( viewDir_immutable ).toVar();
    const lightDir = vec3( lightDir_immutable ).toVar();
    const normal = vec3( normal_immutable ).toVar();
    const dotNL = float( saturate( dot( normal, lightDir ) ) ).toVar();
    const r = vec3( normalize( reflect( lightDir.negate(), normal ) ) ).toVar();
    const phongValue = float( max( 0.0, dot( viewDir, r ) ) ).toVar();
    phongValue.assign( pow( phongValue, 32.0 ) );
    const specular = vec3( dotNL.mul( vec3( phongValue ) ) ).toVar();

    return specular;

} ).setLayout( {
    name: 'phongSpecular',
    type: 'vec3',
    inputs: [
        { name: 'normal', type: 'vec3' },
        { name: 'lightDir', type: 'vec3' },
        { name: 'viewDir', type: 'vec3' }
    ]
} );

export {
    rotateY,
    rotateZ,
    emission,
    facture,
    scaleWithCenter,
    directionalBlur,
    murmurHash21,
    hash21,
    _hash,
    easeOut,
    rotateAxis,
    bezier,
    bezierGrad,
    noise,
    terrainHeight,
    phongSpecular,
    hemiLight,
    lambertLight
}
