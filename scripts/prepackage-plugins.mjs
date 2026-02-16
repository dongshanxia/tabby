#!/usr/bin/env node
import { rebuild } from '@electron/rebuild'
import sh from 'shelljs'
import path from 'node:path'
import fs from 'node:fs'
import * as vars from './vars.mjs'
import log from 'npmlog'

import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))


let target = path.resolve(__dirname, '../builtin-plugins')
sh.mkdir('-p', target)
fs.writeFileSync(path.join(target, 'package.json'), '{}')

// Plugins that require dist directory (TypeScript/Webpack compiled)
const pluginsRequiringDist = [
    'tabby-local',
    'tabby-ssh',
    'tabby-serial',
    'tabby-telnet',
    'tabby-electron',
    'tabby-plugin-manager',
    'tabby-linkifier',
    'tabby-auto-sudo-password',
    'tabby-terminal',
    'tabby-settings',
    'tabby-community-color-schemes',
]

vars.builtinPlugins.forEach(plugin => {
    if (plugin === 'tabby-web') {
        return
    }

    const pluginSourcePath = path.resolve(__dirname, '..', plugin)

    // Check if plugin requires dist directory
    if (pluginsRequiringDist.includes(plugin)) {
        const distPath = path.join(pluginSourcePath, 'dist')
        if (!fs.existsSync(distPath)) {
            log.error('prepackage', `Plugin ${plugin} requires dist directory but it doesn't exist at ${distPath}`)
            log.error('prepackage', 'Make sure to run "yarn run build" before prepackaging plugins')
            process.exit(1)
        }
        // Verify dist/index.js exists
        const indexPath = path.join(distPath, 'index.js')
        if (!fs.existsSync(indexPath)) {
            log.error('prepackage', `Plugin ${plugin} dist/index.js doesn't exist at ${indexPath}`)
            process.exit(1)
        }
        log.info('prepackage', `Verified dist directory for ${plugin}`)
    }

    log.info('install', plugin)
    const targetPluginPath = path.join(target, plugin)

    // Remove existing plugin directory if it exists
    if (fs.existsSync(targetPluginPath)) {
        sh.rm('-rf', targetPluginPath)
    }

    // Use fs.cpSync for more reliable cross-platform copying
    fs.cpSync(pluginSourcePath, targetPluginPath, { recursive: true, force: true })

    // Remove node_modules and rebuild
    sh.rm('-rf', path.join(targetPluginPath, 'node_modules'))
    sh.cd(targetPluginPath)

    // Check if package.json exists before running yarn install
    if (!fs.existsSync('package.json')) {
        log.error('prepackage', `package.json not found in ${targetPluginPath}`)
        process.exit(1)
    }

    sh.exec('yarn install --force --production', { fatal: true })

    log.info('rebuild', 'native')
    if (fs.existsSync('node_modules')) {
        rebuild({
            buildPath: path.resolve('.'),
            electronVersion: vars.electronVersion,
            arch: process.env.ARCH ?? process.arch,
            force: true,
            useCache: false,
        })
    }
    sh.cd(target)
})
fs.unlinkSync(path.join(target, 'package.json'))
