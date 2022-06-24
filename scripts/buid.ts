import glob from 'glob'
import rimraf from 'rimraf'
import child_process from 'child_process'
import path from 'path'

class Build {
    /** build all packages */
    exec(): void {
        let projects: Array<string> = glob.sync('./packages/store*/', { absolute: true }).sort()
        this.executeTaskSync(projects)
    }

    /** 同步执行构建任务 */
    executeTaskSync(projects: Array<string>, appoint?: '*' | string): void {
        const range: string = appoint || '*'
        rimraf.sync(`packages/${range}/dist/`)
        rimraf.sync(`packages/${range}/typings/`)
        for (let cwd of projects) {
            console.log('> build: ', path.basename(cwd))
            try {
                child_process.execSync('yarn build', { cwd })
            } catch (error) {
                console.log('erro: build failure', path.basename(cwd))
            }
        }
    }
}

new Build().exec()
