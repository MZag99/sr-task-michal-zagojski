import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Modals } from './Modals';

// Mock DOM setup
const createMockModal = (id: string, hasVideo = false, hasCloseButton = true) => {
    const modal = document.createElement('div');
    modal.className = 'm-modal';
    modal.setAttribute('data-modal-id', id);

    if (hasCloseButton) {
        const closeButton = document.createElement('button');
        closeButton.setAttribute('data-modal-close', '');
        modal.appendChild(closeButton);
    }

    if (hasVideo) {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'm-modal__video';
        const iframe = document.createElement('iframe');
        iframe.src = 'https://example.com/video';
        videoContainer.appendChild(iframe);
        modal.appendChild(videoContainer);
    }

    return modal;
};

describe('Modals', () => {
    let modals: Modals;
    let modal1: HTMLElement;
    let modal2: HTMLElement;
    let modalWithVideo: HTMLElement;

    beforeEach(() => {
        // Clear document body
        document.body.innerHTML = '';
        document.body.className = '';

        // Create mock modals
        modal1 = createMockModal('test-modal-1');
        modal2 = createMockModal('test-modal-2');
        modalWithVideo = createMockModal('video-modal', true);

        // Add modals to DOM
        document.body.appendChild(modal1);
        document.body.appendChild(modal2);
        document.body.appendChild(modalWithVideo);

        // Create instance after DOM setup
        modals = new Modals();
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        document.body.className = '';

        // Remove all event listeners
        document.removeEventListener('click', () => { });
        document.removeEventListener('keydown', () => { });
    });

    describe('constructor', () => {
        it('should initialize with available modals', () => {
            expect(modals.availableModals.size).toBe(3);
            expect(modals.availableModals.has('test-modal-1')).toBe(true);
            expect(modals.availableModals.has('test-modal-2')).toBe(true);
            expect(modals.availableModals.has('video-modal')).toBe(true);
        });

        it('should get modal elements correctly', () => {
            const modal = modals.availableModals.get('test-modal-1');
            expect(modal).toBe(modal1);
            expect(modal?.getAttribute('data-modal-id')).toBe('test-modal-1');
        });
    });

    describe('open method', () => {
        it('should open an existing modal', () => {
            modals.open('test-modal-1');

            expect(document.body.classList.contains('is-modal-open')).toBe(true);
            expect(modal1.classList.contains('is-open')).toBe(true);
        });

        it('should not affect other modals when opening one', () => {
            modals.open('test-modal-1');

            expect(modal1.classList.contains('is-open')).toBe(true);
            expect(modal2.classList.contains('is-open')).toBe(false);
        });

        it('should do nothing when trying to open non-existent modal', () => {
            const bodyClassesBefore = document.body.className;

            modals.open('non-existent-modal');

            expect(document.body.className).toBe(bodyClassesBefore);
        });

        it('should handle opening multiple modals', () => {
            modals.open('test-modal-1');
            modals.open('test-modal-2');

            expect(document.body.classList.contains('is-modal-open')).toBe(true);
            expect(modal1.classList.contains('is-open')).toBe(true);
            expect(modal2.classList.contains('is-open')).toBe(true);
        });
    });

    describe('close method', () => {
        beforeEach(() => {
            // Open modal first
            modals.open('test-modal-1');
        });

        it('should close an open modal', () => {
            modals.close('test-modal-1');

            expect(document.body.classList.contains('is-modal-open')).toBe(false);
            expect(modal1.classList.contains('is-open')).toBe(false);
        });

        it('should do nothing when trying to close non-existent modal', () => {
            modals.close('non-existent-modal');

            // Modal should still be open
            expect(document.body.classList.contains('is-modal-open')).toBe(true);
            expect(modal1.classList.contains('is-open')).toBe(true);
        });

        it('should handle video modals by resetting iframe src', () => {
            modals.open('video-modal');
            const iframe = modalWithVideo.querySelector('iframe') as HTMLIFrameElement;
            const originalSrc = iframe.src;

            modals.close('video-modal');

            expect(iframe.src).toBe(originalSrc);
            expect(modalWithVideo.classList.contains('is-open')).toBe(false);
        });

        it('should handle closing modal without video', () => {
            modals.close('test-modal-1');

            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });
    });

    describe('event binding', () => {
        it('should close modal when close button is clicked', () => {
            modals.open('test-modal-1');
            const closeButton = modal1.querySelector('[data-modal-close]') as HTMLElement;

            closeButton.click();

            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });

        it('should close modal when clicking outside (on modal background)', () => {
            modals.open('test-modal-1');

            // Simulate click on modal background
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', {
                value: modal1,
                enumerable: true
            });

            modal1.dispatchEvent(clickEvent);

            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });

        it('should close all modals when Escape key is pressed', () => {
            modals.open('test-modal-1');
            modals.open('test-modal-2');

            // Simulate Escape key press
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(modal2.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });

        it('should not close modal when other keys are pressed', () => {
            modals.open('test-modal-1');

            // Simulate other key press
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            document.dispatchEvent(enterEvent);

            expect(modal1.classList.contains('is-open')).toBe(true);
            expect(document.body.classList.contains('is-modal-open')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle modal without close button', () => {
            const modalWithoutButton = createMockModal('no-button-modal', false, false);
            document.body.appendChild(modalWithoutButton);

            // Recreate modals instance to include new modal
            modals = new Modals();

            expect(() => modals.open('no-button-modal')).not.toThrow();
            expect(() => modals.close('no-button-modal')).not.toThrow();
        });

        it('should handle modal without data-modal-id attribute on close button click', () => {
            const modal = createMockModal('test-modal');
            modal.removeAttribute('data-modal-id');
            document.body.appendChild(modal);

            modals = new Modals();

            const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement;
            expect(() => closeButton.click()).not.toThrow();
        });

        it('should handle video modal without iframe', () => {
            const modalDiv = document.createElement('div');
            modalDiv.className = 'm-modal';
            modalDiv.setAttribute('data-modal-id', 'broken-video-modal');

            const videoContainer = document.createElement('div');
            videoContainer.className = 'm-modal__video';
            // No iframe added
            modalDiv.appendChild(videoContainer);

            const closeButton = document.createElement('button');
            closeButton.setAttribute('data-modal-close', '');
            modalDiv.appendChild(closeButton);

            document.body.appendChild(modalDiv);

            modals = new Modals();

            expect(() => modals.open('broken-video-modal')).not.toThrow();
            expect(() => modals.close('broken-video-modal')).not.toThrow();
        });

        it('should handle iframe without src attribute', () => {
            const modalDiv = document.createElement('div');
            modalDiv.className = 'm-modal';
            modalDiv.setAttribute('data-modal-id', 'no-src-modal');

            const videoContainer = document.createElement('div');
            videoContainer.className = 'm-modal__video';
            const iframe = document.createElement('iframe');
            // No src attribute
            videoContainer.appendChild(iframe);
            modalDiv.appendChild(videoContainer);

            const closeButton = document.createElement('button');
            closeButton.setAttribute('data-modal-close', '');
            modalDiv.appendChild(closeButton);

            document.body.appendChild(modalDiv);

            modals = new Modals();

            expect(() => modals.close('no-src-modal')).not.toThrow();
        });
    });

    describe('integration scenarios', () => {
        it('should handle rapid open/close operations', () => {
            // Rapid operations
            modals.open('test-modal-1');
            modals.close('test-modal-1');
            modals.open('test-modal-1');
            modals.close('test-modal-1');

            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });

        it('should handle multiple modals workflow', () => {
            // Open first modal
            modals.open('test-modal-1');
            expect(modal1.classList.contains('is-open')).toBe(true);

            // Open second modal while first is open
            modals.open('test-modal-2');
            expect(modal2.classList.contains('is-open')).toBe(true);
            expect(modal1.classList.contains('is-open')).toBe(true);

            // Close first modal
            modals.close('test-modal-1');
            expect(modal1.classList.contains('is-open')).toBe(false);
            expect(modal2.classList.contains('is-open')).toBe(true);

            // Close second modal
            modals.close('test-modal-2');
            expect(modal2.classList.contains('is-open')).toBe(false);
            expect(document.body.classList.contains('is-modal-open')).toBe(false);
        });
    });
});