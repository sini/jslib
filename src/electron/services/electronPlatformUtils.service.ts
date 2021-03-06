import {
    clipboard,
    remote,
    shell,
} from 'electron';

import {
    isDev,
    isMacAppStore,
} from '../utils';

import { DeviceType } from '../../enums/deviceType';

import { I18nService } from '../../abstractions/i18n.service';
import { PlatformUtilsService } from '../../abstractions/platformUtils.service';

import { AnalyticsIds } from '../../misc/analytics';
import { Utils } from '../../misc/utils';

export class ElectronPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string;

    private deviceCache: DeviceType = null;
    private analyticsIdCache: string = null;

    constructor(private i18nService: I18nService, private isDesktopApp: boolean) {
        this.identityClientId = isDesktopApp ? 'desktop' : 'connector';
    }

    getDevice(): DeviceType {
        if (!this.deviceCache) {
            switch (process.platform) {
                case 'win32':
                    this.deviceCache = DeviceType.Windows;
                    break;
                case 'darwin':
                    this.deviceCache = DeviceType.MacOs;
                    break;
                case 'linux':
                default:
                    this.deviceCache = DeviceType.Linux;
                    break;
            }
        }

        return this.deviceCache;
    }

    getDeviceString(): string {
        return DeviceType[this.getDevice()].toLowerCase();
    }

    isFirefox(): boolean {
        return false;
    }

    isChrome(): boolean {
        return true;
    }

    isEdge(): boolean {
        return false;
    }

    isOpera(): boolean {
        return false;
    }

    isVivaldi(): boolean {
        return false;
    }

    isSafari(): boolean {
        return false;
    }

    isMacAppStore(): boolean {
        return isMacAppStore();
    }

    analyticsId(): string {
        if (!this.isDesktopApp) {
            return null;
        }

        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = (AnalyticsIds as any)[this.getDevice()];
        return this.analyticsIdCache;
    }

    getDomain(uriString: string): string {
        return Utils.getHostname(uriString);
    }

    isViewOpen(): boolean {
        return false;
    }

    launchUri(uri: string, options?: any): void {
        shell.openExternal(uri);
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        const blob = new Blob([blobData], blobOptions);
        const a = win.document.createElement('a');
        a.href = win.URL.createObjectURL(blob);
        a.download = fileName;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
    }

    getApplicationVersion(): string {
        return remote.app.getVersion();
    }

    supportsU2f(win: Window): boolean {
        // Not supported in Electron at this time.
        // ref: https://github.com/electron/electron/issues/3226
        return false;
    }

    showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string):
        Promise<boolean> {
        const buttons = [confirmText == null ? this.i18nService.t('ok') : confirmText];
        if (cancelText != null) {
            buttons.push(cancelText);
        }

        const result = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: type,
            title: title,
            message: title,
            detail: text,
            buttons: buttons,
            cancelId: buttons.length === 2 ? 1 : null,
            defaultId: 0,
            noLink: true,
        });

        return Promise.resolve(result === 0);
    }

    isDev(): boolean {
        return isDev();
    }

    copyToClipboard(text: string, options?: any): void {
        const type = options ? options.type : null;
        clipboard.writeText(text, type);
    }
}
