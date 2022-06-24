import glob from 'glob'
import path from 'path'
import fs from 'fs'
import prettier from 'prettier'
import chalk from 'chalk'
import markdownTable from 'markdown-table'
import { gzipSync } from 'zlib'
import { compress } from 'brotli-wasm'

/** 格式化源代码 */
export const format = (source: string, { parser }: any): string => prettier.format(source, { parser })

const MAX_FILE_SIZE: number = 10 // kb
const WARN_FILE_SIZE: number = 5 // kb

class TotalSize {
    /** calc dist file(js) size */
    async exec(): Promise<void> {
        const files = glob.sync('packages/store**/dist/es/**', { cwd: process.cwd(), ignore: '.d.ts' })
        let rows: Array<Array<string | number>> = []
        // calc and log
        for (const filePath of files) {
            const row: Array<string | number> | undefined = await this.total(filePath)
            if (!row) continue
            rows.push(row)
        }

        // count all
        this.count(rows)

        // add [kb] and check max
        this.transform(rows)

        rows.unshift(['path', 'origin size', 'gzipped size', 'compressed size'].map((lab) => chalk.blueBright(lab)))

        // out
        console.log(
            format(
                markdownTable(<Array<Array<string>>>rows, {
                    alignDelimiters: true,
                    align: ['left', 'right', 'right', 'right']
                }),
                { parser: 'markdown' }
            )
        )
    }

    /** total appoint file size */
    async total(filePath: string): Promise<Array<string | number> | undefined> {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return
        const num2kb = (num: number): number => Number((num / 1024).toFixed(2))
        const file = fs.readFileSync(filePath)
        const minSize = file.length
        const gzipped = gzipSync(file)
        const gzippedSize = gzipped.length
        const compressed = await compress(file)
        const compressedSize = compressed.length
        return [path.relative('packages', filePath), num2kb(minSize), num2kb(gzippedSize), num2kb(compressedSize)]
    }

    /** count size by row */
    count(rows: Array<Array<string | number>>): void {
        let count = new Array(4).fill(0)
        for (let n = 0; n < rows.length; n++) {
            let row = rows[n]
            const [, o, g, c] = row
            count[1] += o
            count[2] += g
            count[3] += c
        }
        count = count.map((c) => Number(c.toFixed(2)))
        count[0] = chalk.hex('#ffffff')('count all')
        rows.push(count)
    }

    transform(rows: Array<Array<string | number>>): void {
        for (const row of rows) {
            for (let n = 1; n < row.length; n++) {
                if (typeof row[n] !== 'number') continue
                if (row[n] > MAX_FILE_SIZE) {
                    row[n] = chalk.red(`${row[n]}kb`)
                } else if (row[n] > WARN_FILE_SIZE) {
                    row[n] = chalk.yellowBright(`${row[n]}kb`)
                } else {
                    row[n] = chalk.gray(`${row[n]}kb`)
                }
            }
        }
    }
}

new TotalSize().exec()
