import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import {
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { I18nService } from '../../abstractions/i18n.service';
import { PasswordGenerationService } from '../../abstractions/passwordGeneration.service';
import { PlatformUtilsService } from '../../abstractions/platformUtils.service';

export class PasswordGeneratorComponent implements OnInit {
    @Input() showSelect: boolean = false;
    @Output() onSelected = new EventEmitter<string>();

    options: any = {};
    password: string = '-';
    showOptions = false;
    avoidAmbiguous = false;

    constructor(protected passwordGenerationService: PasswordGenerationService, protected analytics: Angulartics2,
        protected platformUtilsService: PlatformUtilsService, protected i18nService: I18nService,
        protected toasterService: ToasterService, private win: Window) { }

    async ngOnInit() {
        this.options = await this.passwordGenerationService.getOptions();
        this.avoidAmbiguous = !this.options.ambiguous;
        this.password = await this.passwordGenerationService.generatePassword(this.options);
        this.analytics.eventTrack.next({ action: 'Generated Password' });
        await this.passwordGenerationService.addHistory(this.password);
    }

    async sliderChanged() {
        this.saveOptions(false);
        await this.passwordGenerationService.addHistory(this.password);
        this.analytics.eventTrack.next({ action: 'Regenerated Password' });
    }

    async sliderInput() {
        this.normalizeOptions();
        this.password = await this.passwordGenerationService.generatePassword(this.options);
    }

    async saveOptions(regenerate: boolean = true) {
        this.normalizeOptions();
        await this.passwordGenerationService.saveOptions(this.options);

        if (regenerate) {
            await this.regenerate();
        }
    }

    async regenerate() {
        this.password = await this.passwordGenerationService.generatePassword(this.options);
        await this.passwordGenerationService.addHistory(this.password);
        this.analytics.eventTrack.next({ action: 'Regenerated Password' });
    }

    copy() {
        this.analytics.eventTrack.next({ action: 'Copied Generated Password' });
        const copyOptions = this.win != null ? { doc: this.win.document } : null;
        this.platformUtilsService.copyToClipboard(this.password, copyOptions);
        this.toasterService.popAsync('info', null, this.i18nService.t('valueCopied', this.i18nService.t('password')));
    }

    select() {
        this.analytics.eventTrack.next({ action: 'Selected Generated Password' });
        this.onSelected.emit(this.password);
    }

    toggleOptions() {
        this.showOptions = !this.showOptions;
    }

    private normalizeOptions() {
        this.options.minLowercase = 0;
        this.options.minUppercase = 0;
        this.options.ambiguous = !this.avoidAmbiguous;

        if (!this.options.uppercase && !this.options.lowercase && !this.options.number && !this.options.special) {
            this.options.lowercase = true;
            const lowercase = document.querySelector('#lowercase') as HTMLInputElement;
            if (lowercase) {
                lowercase.checked = true;
            }
        }

        if (!this.options.length) {
            this.options.length = 5;
        } else if (this.options.length > 128) {
            this.options.length = 128;
        }

        if (!this.options.minNumber) {
            this.options.minNumber = 0;
        } else if (this.options.minNumber > this.options.length) {
            this.options.minNumber = this.options.length;
        } else if (this.options.minNumber > 9) {
            this.options.minNumber = 9;
        }

        if (!this.options.minSpecial) {
            this.options.minSpecial = 0;
        } else if (this.options.minSpecial > this.options.length) {
            this.options.minSpecial = this.options.length;
        } else if (this.options.minSpecial > 9) {
            this.options.minSpecial = 9;
        }

        if (this.options.minSpecial + this.options.minNumber > this.options.length) {
            this.options.minSpecial = this.options.length - this.options.minNumber;
        }
    }
}
