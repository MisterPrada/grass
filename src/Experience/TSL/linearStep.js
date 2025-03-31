import { float, clamp, Fn } from 'three/tsl';

const linearStep = /*#__PURE__*/ Fn( ( [ edge0_immutable, edge1_immutable, x_immutable ] ) => {

    const x = float( x_immutable ).toVar();
    const edge1 = float( edge1_immutable ).toVar();
    const edge0 = float( edge0_immutable ).toVar();

    return clamp( x.sub( edge0 ).div( edge1.sub( edge0 ) ), 0.0, 1.0 );

} ).setLayout( {
    name: 'linearStep',
    type: 'float',
    inputs: [
        { name: 'edge0', type: 'float' },
        { name: 'edge1', type: 'float' },
        { name: 'x', type: 'float' }
    ]
} );

export { linearStep };
