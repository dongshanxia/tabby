import * as path from 'path'
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const config = {
    target: 'node',
    entry: '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/node_modules/tabby-telnet/src/index.ts',
    output: {
        path: '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/node_modules/tabby-telnet/dist',
        filename: 'index.js',
        libraryTarget: 'umd',
        publicPath: 'auto',
    },
    mode: 'development',
    resolve: {
        modules: [
            '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/node_modules/tabby-telnet',
            '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/node_modules',
            '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/app/node_modules',
        ],
        extensions: ['.ts', '.js'],
    },
    externals: [
        '@angular/core',
        '@angular/common',
        '@angular/forms',
        'rxjs',
        'tabby-core',
        'tabby-settings',
        'tabby-terminal',
        'ngx-toastr',
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: '@ngtools/webpack',
            },
        ],
    },
    plugins: [
        new (await import('@ngtools/webpack')).AngularWebpackPlugin.default({
            tsconfig: '/home/zhu/Qsyc/WorkWork/gogotaishiji/tabby/node_modules/tabby-telnet/tsconfig.json',
            directTemplateLoading: false,
            jitMode: true,
        })
    ],
}

export default config
