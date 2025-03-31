export function mix( x, y, a ) {
    return x * ( 1 - a ) + y * a;
}

export function remap( x, oMin, oMax, nMin, nMax ) {
    return mix( nMin, nMax, ( x - oMin ) / ( oMax - oMin ) );
}

export function simplexNoise4d( x, y, z, w ) {
    return simplex.noise4d( x, y, z, w );
}

export function lerp( x, y, t ) {
    return ( 1 - t ) * x + t * y;
}

export function damp( x, y, t, delta ) {
    return lerp( x, y, 1 - Math.exp( Math.log( 1 - t ) * ( delta / 16.6666 ) ) );
}

// ... in case you use gsap
export function dampGSAP( x, y, t ) {
    return lerp( x, y, 1 - Math.exp( Math.log( 1 - t ) * gsap.ticker.deltaRatio( 60 ) ) );
}
