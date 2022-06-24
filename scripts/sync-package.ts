import pkg from '../package.json'
import glob from 'glob'
import * as path from 'path'
import * as fs from 'fs'

/** 同步 package.json 信息 */
class SyncPackage {
    /** 同步字段 */
    keywords: Array<string> = ['version', 'license', 'author', 'repository']

    /** 执行 */
    exec(): void {
        const projects: Array<string> = pkg.workspaces
            .map((rule) => glob.sync(rule)) // scan
            .reduce((pros, p) => [...pros, ...p], []) // merge
            .map((p) => path.join(p, 'package.json')) // gen package.json path
            .filter((p) => fs.existsSync(p)) // filter null project
        for (const pkgPath of projects) this.update(pkgPath)
    }

    /** 更新 */
    update(pkgPath: string): void {
        const out = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf-8' }))
        for (const key of this.keywords) out[key] = pkg[key]
        fs.writeFileSync(pkgPath, JSON.stringify(out, null, 4), { encoding: 'utf-8' })
        console.log('> write: ', pkgPath)
    }
}

new SyncPackage().exec()
