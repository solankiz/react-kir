import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

let configArray = [];

const createConfig = (type) => ({
    input: 'src/index.js',
    external: ['react'],
    output: {
        file: `dist/reactKir.${type}.js`,
        format: type,
        name: 'reactKir',
        esModule: type !== 'umd',
        globals: type === 'umd' ? { react: "React" } : undefined
    },
    plugins: [
        resolve(),
        postcss({
            extract: 'dist/styles.css',
        }),
        babel({
            exclude: "node_modules/**"
        }),
        type === 'umd' && terser()
    ]
});

configArray.push(createConfig(process.env.NODE_ENV));

export default [ ...configArray ];