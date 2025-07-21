export class Modals {
    public availableModals = new Map<string, HTMLElement>();

    constructor() {
        this._getAvailableModals();
        this._bindEvents();
    }


    public open(modalId: string): void {
        const modal = this.availableModals.get(modalId);
        if (modal) {
            document.body.classList.add('is-modal-open');
            modal.classList.add('is-open');
        }
    }


    public close(modalId: string): void {
        const modal = this.availableModals.get(modalId);
        
        
        if (modal) {
            document.body.classList.remove('is-modal-open');
            modal.classList.remove('is-open');

            // Stop all iframe videos when modal is closed
            const video = modal.querySelector('.m-modal__video iframe');
            if (video) {
                const src = video.getAttribute('src');
                if (src) {
                    video.setAttribute('src', ''); // Reset the src to stop the video
                    video.setAttribute('src', src); // Restore the src to allow replaying
                }
            }
        }
    }


    private _bindEvents(): void {
        // Close modals on close button click
        const modalsArray = this.availableModals.values();
        for (const modal of modalsArray) {
            const closeButton = modal.querySelector('[data-modal-close]');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.close(modal.getAttribute('data-modal-id') || '');
                });
            }
        }

        // Close modals on outside click
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('m-modal')) {
                this.close(target.getAttribute('data-modal-id') || '');
            }
        });


        // Close all modals on Escape key press
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.availableModals.forEach((_modal, modalId) => {
                    this.close(modalId);
                });
            }
        }
        );
    }


    private _getAvailableModals(): void {
        const modals = document.querySelectorAll('[data-modal-id]');
        modals.forEach((modal) => {
            const modalId = modal.getAttribute('data-modal-id');
            if (modalId) {
                this.availableModals.set(modalId, modal as HTMLElement);
            }
        });
    }
}