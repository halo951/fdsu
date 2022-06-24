import * as fs from 'fs'
import * as path from 'path'
import pkg from '../package.json'

/** target path */
const t = (...mn: Array<string>) => path.join(process.cwd(), 'packages', ...mn)

/** create new module util */
class Create {
    exec(): void {
        if (process.argv.length !== 3) {
            console.log('Tip: `yarn c` need has [module name], example for `yarn c [module name]`')
            process.exit(0)
        }
        const [, , moduleName] = process.argv

        this.checkExists(moduleName)

        this.createDir(moduleName)
        this.writePkg(moduleName)
        this.writeReadme(moduleName)
        this.writeTsConfig(moduleName)
        this.writeSrc(moduleName)
        this.writeTests(moduleName)
    }

    /** 检查是否已存在 */
    checkExists(mn: string): void {
        const existed: boolean = fs.existsSync(t(mn))
        if (existed) {
            console.log(`Tip: '${mn}' is existed.`)
            process.exit(0)
        }
    }

    /** 创建目标文件夹 */
    createDir(mn: string): void {
        fs.mkdirSync(t(mn))
    }

    /** 写入package.json */
    writePkg(mn: string): void {
        const obj = {
            name: `@fdsu/${mn}`,
            description: `${mn} for fdsu`,
            version: pkg.version,
            keywords: [],
            main: 'dist/cjs/index.js',
            module: 'dist/es/index.js',
            typings: 'typings/index.d.ts',
            sideEffects: false,
            author: pkg.author,
            repository: pkg.repository,
            bugs: pkg.bugs,
            license: pkg.license,
            scripts: {
                clean: 'rimraf dist && rimraf typings',
                build: 'yarn clean && rollup --config ../../rollup.config.ts --configPlugin typescript2',
                'lint:fix': 'prettier -w **.ts **.md **.json',
                test: 'cd ../../ & yarn test'
            },
            dependencies: {},
            devDependencies: {}
        }
        fs.writeFileSync(t(mn, 'package.json'), JSON.stringify(obj, null, 4), { encoding: 'utf-8' })
    }

    /** 写入 src */
    writeSrc(mn: string): void {
        fs.mkdirSync(t(mn, 'src'))
        fs.writeFileSync(t(mn, 'src/index.ts'), '', { encoding: 'utf-8' })
    }

    /** 写入 tests */
    writeTests(mn: string): void {
        fs.mkdirSync(t(mn, '__tests__'))
        fs.writeFileSync(t(mn, '__tests__/common.test.ts'), '', { encoding: 'utf-8' })
    }

    /** 写入README.md */
    writeReadme(mn: string): void {
        fs.writeFileSync(t(mn, 'README.md'), `# @fdsu/${mn}`, { encoding: 'utf-8' })
    }

    /** 写入 tsconfig.json */
    writeTsConfig(mn: string): void {
        fs.copyFileSync(t('store', 'tsconfig.json'), t(mn, 'tsconfig.json'))
    }
}

new Create().exec()
