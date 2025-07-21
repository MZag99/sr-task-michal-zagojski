import iconStar from '../assets/svg/star.svg?raw';
import iconPlay from '../assets/svg/play.svg?raw';
import iconCross from '../assets/svg/cross.svg?raw';

import { Modals } from './Modals';

const ICONS = {
    star: iconStar,
    play: iconPlay,
    cross: iconCross
}

export class Site {
    public static instance: Site;

    private _modals: Modals;

    constructor() {
        Site.instance = this;
        this._modals = new Modals();

        // Replace svg icons
        this._replaceSvgIcons();

        // Bind events
        this._bindEvents();
    }


    private _bindEvents(): void {
        // Bind buttons to open modals
        const modalButtons = document.querySelectorAll('[data-modal-target]');
        modalButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal-target');

                if (!modalId) {
                    console.warn('No modal ID specified for button');
                    return;
                }

                this._modals.open(modalId);
            });
        });
    }


    private _replaceSvgIcons(): void {
        const elsToReplace = document.querySelectorAll('[data-icon]');

        elsToReplace.forEach((el) => {
            const iconName = el.getAttribute('data-icon');
            const svgContent = ICONS[iconName as keyof typeof ICONS];

            if (iconName && svgContent) {
                el.innerHTML = svgContent;
            } else {
                console.warn(`Icon ${iconName} not found`);
            }
        });

        document.body.classList.add('is-loaded');
    }
}