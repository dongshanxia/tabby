import { Injectable } from '@angular/core'
import { HostAppService } from './api/hostApp'
import { CLIHandler, CLIEvent } from './api/cli'
import { HostWindowService } from './api/hostWindow'
import { QuickConnectProfileProvider } from './api/profileProvider'
import { ProfilesService } from './services/profiles.service'

@Injectable()
export class ProfileCLIHandler extends CLIHandler {
    firstMatchOnly = true
    priority = 0

    constructor (
        private profiles: ProfilesService,
        private hostWindow: HostWindowService,
    ) {
        super()
    }

    async handle (event: CLIEvent): Promise<boolean> {
        console.log('[CLI] handle event:', event)
        const op = event.argv._[0]
        console.log('[CLI] op:', op)

        if (op === 'profile') {
            this.handleOpenProfile(event.argv.profileName!)
            return true
        }
        if (op === 'recent') {
            this.handleOpenRecentProfile(event.argv.profileNumber!)
            return true
        }
        if (op === 'quickConnect') {
            console.log('[CLI] quickConnect - providerId:', event.argv.providerId, 'query:', event.argv.query, 'password:', (event.argv as any).password)
            this.handleOpenQuickConnect(event.argv.providerId!, event.argv.query!, (event.argv as any).password)
            return true
        }
        return false
    }

    private async handleOpenProfile (profileName: string) {
        const profile = (await this.profiles.getProfiles()).find(x => x.name === profileName)
        if (!profile) {
            console.error('Requested profile', profileName, 'not found')
            return
        }
        this.profiles.openNewTabForProfile(profile)
        this.hostWindow.bringToFront()
    }

    private async handleOpenRecentProfile (profileNumber: number) {
        const profiles = this.profiles.getRecentProfiles()
        if (profileNumber >= profiles.length) {
            return
        }
        this.profiles.openNewTabForProfile(profiles[profileNumber])
        this.hostWindow.bringToFront()
    }

    private async handleOpenQuickConnect (providerId: string, query: string, password?: string) {
        console.log('[CLI] handleOpenQuickConnect - providerId:', providerId, 'query:', query, 'password:', password)
        const quickConnectProviders = this.profiles.getProviders()
            .filter((x): x is QuickConnectProfileProvider<any> => x instanceof QuickConnectProfileProvider)
        console.log('[CLI] quickConnectProviders:', quickConnectProviders.map(x => x.id))
        const provider = quickConnectProviders.find(x => x.id === providerId)
        if(!provider) {
            const available = quickConnectProviders.map(x => x.id).join(', ')
            console.error(`Requested provider "${providerId}" not found. Available providers: ${available}`)
            return
        }
        console.log('[CLI] found provider:', provider.id)
        const profile = provider.quickConnect(query, password)
        console.log('[CLI] profile from quickConnect:', profile)
        if(!profile) {
            console.error(`Could not parse quick connect query "${query}"`)
            return
        }
        console.log('[CLI] opening new tab for profile')
        this.profiles.openNewTabForProfile(profile)
        this.hostWindow.bringToFront()
    }
}

@Injectable()
export class LastCLIHandler extends CLIHandler {
    firstMatchOnly = true
    priority = -999

    constructor (private hostApp: HostAppService) {
        super()
    }

    async handle (event: CLIEvent): Promise<boolean> {
        if (event.secondInstance) {
            this.hostApp.newWindow()
            return true
        }
        return false
    }
}
