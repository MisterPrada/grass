import { vec4, floor, Fn, float, overloadingFn, mul, sub, vec3, fract, abs, dot, lessThan, step, clamp, vec2, max, int } from 'three/tsl';

const mod289_0 = /*#__PURE__*/ Fn( ( [ x_immutable ] ) => {

    const x = vec4( x_immutable ).toVar();

    return x.sub( floor( x.mul( 1.0 / 289.0 ) ).mul( 289.0 ) );

} ).setLayout( {
    name: 'mod289_0',
    type: 'vec4',
    inputs: [
        { name: 'x', type: 'vec4' }
    ]
} );

const mod289_1 = /*#__PURE__*/ Fn( ( [ x_immutable ] ) => {

    const x = float( x_immutable ).toVar();

    return x.sub( floor( x.mul( 1.0 / 289.0 ) ).mul( 289.0 ) );

} ).setLayout( {
    name: 'mod289_1',
    type: 'float',
    inputs: [
        { name: 'x', type: 'float' }
    ]
} );

const mod289 = /*#__PURE__*/ overloadingFn( [ mod289_0, mod289_1 ] );

const permute_0 = /*#__PURE__*/ Fn( ( [ x_immutable ] ) => {

    const x = vec4( x_immutable ).toVar();

    return mod289( x.mul( 34.0 ).add( 1.0 ).mul( x ) );

} ).setLayout( {
    name: 'permute_0',
    type: 'vec4',
    inputs: [
        { name: 'x', type: 'vec4' }
    ]
} );

const permute_1 = /*#__PURE__*/ Fn( ( [ x_immutable ] ) => {

    const x = float( x_immutable ).toVar();

    return mod289( x.mul( 34.0 ).add( 1.0 ).mul( x ) );

} ).setLayout( {
    name: 'permute_1',
    type: 'float',
    inputs: [
        { name: 'x', type: 'float' }
    ]
} );

const permute = /*#__PURE__*/ overloadingFn( [ permute_0, permute_1 ] );

const taylorInvSqrt_0 = /*#__PURE__*/ Fn( ( [ r_immutable ] ) => {

    const r = vec4( r_immutable ).toVar();

    return sub( 1.79284291400159, mul( 0.85373472095314, r ) );

} ).setLayout( {
    name: 'taylorInvSqrt_0',
    type: 'vec4',
    inputs: [
        { name: 'r', type: 'vec4' }
    ]
} );

const taylorInvSqrt_1 = /*#__PURE__*/ Fn( ( [ r_immutable ] ) => {

    const r = float( r_immutable ).toVar();

    return sub( 1.79284291400159, mul( 0.85373472095314, r ) );

} ).setLayout( {
    name: 'taylorInvSqrt_1',
    type: 'float',
    inputs: [
        { name: 'r', type: 'float' }
    ]
} );

const taylorInvSqrt = /*#__PURE__*/ overloadingFn( [ taylorInvSqrt_0, taylorInvSqrt_1 ] );

const grad4 = /*#__PURE__*/ Fn( ( [ j_immutable, ip_immutable ] ) => {

    const ip = vec4( ip_immutable ).toVar();
    const j = float( j_immutable ).toVar();
    const ones = vec4( 1.0, 1.0, 1.0, float( - 1.0 ) );
    const p = vec4().toVar(), s = vec4().toVar();
    p.xyz.assign( floor( fract( vec3( j ).mul( ip.xyz ) ).mul( 7.0 ) ).mul( ip.z ).sub( 1.0 ) );
    p.w.assign( sub( 1.5, dot( abs( p.xyz ), ones.xyz ) ) );
    s.assign( vec4( lessThan( p, vec4( 0.0 ) ) ) );
    p.xyz.assign( p.xyz.add( s.xyz.mul( 2.0 ).sub( 1.0 ).mul( s.www ) ) );

    return p;

} ).setLayout( {
    name: 'grad4',
    type: 'vec4',
    inputs: [
        { name: 'j', type: 'float' },
        { name: 'ip', type: 'vec4' }
    ]
} );

const simplexNoiseDerivatives = /*#__PURE__*/ Fn( ( [ v_immutable ] ) => {

    const v = vec4( v_immutable ).toVar();
    const C = vec4( 0.138196601125011, 0.276393202250021, 0.414589803375032, float( - 0.447213595499958 ) );
    const i = vec4( floor( v.add( dot( v, vec4( 0.309016994374947451 ) ) ) ) ).toVar();
    const x0 = vec4( v.sub( i ).add( dot( i, C.xxxx ) ) ).toVar();
    const i0 = vec4().toVar();
    const isX = vec3( step( x0.yzw, x0.xxx ) ).toVar();
    const isYZ = vec3( step( x0.zww, x0.yyz ) ).toVar();
    i0.x.assign( isX.x.add( isX.y ).add( isX.z ) );
    i0.yzw.assign( sub( 1.0, isX ) );
    i0.y.addAssign( isYZ.x.add( isYZ.y ) );
    i0.zw.addAssign( sub( 1.0, isYZ.xy ) );
    i0.z.addAssign( isYZ.z );
    i0.w.addAssign( sub( 1.0, isYZ.z ) );
    const i3 = vec4( clamp( i0, 0.0, 1.0 ) ).toVar();
    const i2 = vec4( clamp( i0.sub( 1.0 ), 0.0, 1.0 ) ).toVar();
    const i1 = vec4( clamp( i0.sub( 2.0 ), 0.0, 1.0 ) ).toVar();
    const x1 = vec4( x0.sub( i1 ).add( C.xxxx ) ).toVar();
    const x2 = vec4( x0.sub( i2 ).add( C.yyyy ) ).toVar();
    const x3 = vec4( x0.sub( i3 ).add( C.zzzz ) ).toVar();
    const x4 = vec4( x0.add( C.wwww ) ).toVar();
    i.assign( mod289( i ) );
    const j0 = float( permute( permute( permute( permute( i.w ).add( i.z ) ).add( i.y ) ).add( i.x ) ) ).toVar();
    const j1 = vec4( permute( permute( permute( permute( i.w.add( vec4( i1.w, i2.w, i3.w, 1.0 ) ) ).add( i.z ).add( vec4( i1.z, i2.z, i3.z, 1.0 ) ) ).add( i.y ).add( vec4( i1.y, i2.y, i3.y, 1.0 ) ) ).add( i.x ).add( vec4( i1.x, i2.x, i3.x, 1.0 ) ) ) ).toVar();
    const ip = vec4( 1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0 ).toVar();
    const p0 = vec4( grad4( j0, ip ) ).toVar();
    const p1 = vec4( grad4( j1.x, ip ) ).toVar();
    const p2 = vec4( grad4( j1.y, ip ) ).toVar();
    const p3 = vec4( grad4( j1.z, ip ) ).toVar();
    const p4 = vec4( grad4( j1.w, ip ) ).toVar();
    const norm = vec4( taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) ) ).toVar();
    p0.mulAssign( norm.x );
    p1.mulAssign( norm.y );
    p2.mulAssign( norm.z );
    p3.mulAssign( norm.w );
    p4.mulAssign( taylorInvSqrt( dot( p4, p4 ) ) );
    const values0 = vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ) ).toVar();
    const values1 = vec2( dot( p3, x3 ), dot( p4, x4 ) ).toVar();
    const m0 = vec3( max( sub( 0.5, vec3( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ) ) ), 0.0 ) ).toVar();
    const m1 = vec2( max( sub( 0.5, vec2( dot( x3, x3 ), dot( x4, x4 ) ) ), 0.0 ) ).toVar();
    const temp0 = vec3( float( - 6.0 ).mul( m0 ).mul( m0 ).mul( values0 ) ).toVar();
    const temp1 = vec2( float( - 6.0 ).mul( m1 ).mul( m1 ).mul( values1 ) ).toVar();
    const mmm0 = vec3( m0.mul( m0 ).mul( m0 ) ).toVar();
    const mmm1 = vec2( m1.mul( m1 ).mul( m1 ) ).toVar();
    const dx = float( temp0.element( int( 0 ) ).mul( x0.x ).add( temp0.element( int( 1 ) ).mul( x1.x ) ).add( temp0.element( int( 2 ) ).mul( x2.x ) ).add( temp1.element( int( 0 ) ).mul( x3.x ) ).add( temp1.element( int( 1 ) ).mul( x4.x ) ).add( mmm0.element( int( 0 ) ).mul( p0.x ) ).add( mmm0.element( int( 1 ) ).mul( p1.x ) ).add( mmm0.element( int( 2 ) ).mul( p2.x ) ).add( mmm1.element( int( 0 ) ).mul( p3.x ) ).add( mmm1.element( int( 1 ) ).mul( p4.x ) ) ).toVar();
    const dy = float( temp0.element( int( 0 ) ).mul( x0.y ).add( temp0.element( int( 1 ) ).mul( x1.y ) ).add( temp0.element( int( 2 ) ).mul( x2.y ) ).add( temp1.element( int( 0 ) ).mul( x3.y ) ).add( temp1.element( int( 1 ) ).mul( x4.y ) ).add( mmm0.element( int( 0 ) ).mul( p0.y ) ).add( mmm0.element( int( 1 ) ).mul( p1.y ) ).add( mmm0.element( int( 2 ) ).mul( p2.y ) ).add( mmm1.element( int( 0 ) ).mul( p3.y ) ).add( mmm1.element( int( 1 ) ).mul( p4.y ) ) ).toVar();
    const dz = float( temp0.element( int( 0 ) ).mul( x0.z ).add( temp0.element( int( 1 ) ).mul( x1.z ) ).add( temp0.element( int( 2 ) ).mul( x2.z ) ).add( temp1.element( int( 0 ) ).mul( x3.z ) ).add( temp1.element( int( 1 ) ).mul( x4.z ) ).add( mmm0.element( int( 0 ) ).mul( p0.z ) ).add( mmm0.element( int( 1 ) ).mul( p1.z ) ).add( mmm0.element( int( 2 ) ).mul( p2.z ) ).add( mmm1.element( int( 0 ) ).mul( p3.z ) ).add( mmm1.element( int( 1 ) ).mul( p4.z ) ) ).toVar();
    const dw = float( temp0.element( int( 0 ) ).mul( x0.w ).add( temp0.element( int( 1 ) ).mul( x1.w ) ).add( temp0.element( int( 2 ) ).mul( x2.w ) ).add( temp1.element( int( 0 ) ).mul( x3.w ) ).add( temp1.element( int( 1 ) ).mul( x4.w ) ).add( mmm0.element( int( 0 ) ).mul( p0.w ) ).add( mmm0.element( int( 1 ) ).mul( p1.w ) ).add( mmm0.element( int( 2 ) ).mul( p2.w ) ).add( mmm1.element( int( 0 ) ).mul( p3.w ) ).add( mmm1.element( int( 1 ) ).mul( p4.w ) ) ).toVar();

    return vec4( dx, dy, dz, dw ).mul( 49.0 );

} ).setLayout( {
    name: 'simplexNoiseDerivatives',
    type: 'vec4',
    inputs: [
        { name: 'v', type: 'vec4' }
    ]
} );

export { simplexNoiseDerivatives };
