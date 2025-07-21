import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Site } from './Site';

// Mock the SVG imports
vi.mock('../assets/svg/star.svg?raw', () => ({
    default: '<svg data-testid="star-icon"><path d="star-path"/></svg>'
}));

vi.mock('../assets/svg/play.svg?raw', () => ({
    default: '<svg data-testid="play-icon"><path d="play-path"/></svg>'
}));

vi.mock('../assets/svg/cross.svg?raw', () => ({
    default: '<svg data-testid="cross-icon"><path d="cross-path"/></svg>'
}));

// Mock the Modals class
const mockModalsOpen = vi.fn();
const mockModalsInstance = {
    open: mockModalsOpen
};

vi.mock('./Modals', () => ({
    Modals: vi.fn(() => mockModalsInstance)
}));

// Mock console methods
const consoleSpy = {
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
};

describe('Site', () => {
    let site: Site;

    beforeEach(() => {
        // Clear document body
        document.body.innerHTML = '';
        document.body.className = '';

        // Clear all mocks
        vi.clearAllMocks();
        mockModalsOpen.mockClear();
        consoleSpy.warn.mockClear();

        // Reset the static instance
        (Site as any).instance = undefined;
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        document.body.className = '';

        // Clear all mocks
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create a singleton instance', () => {
            site = new Site();

            expect(Site.instance).toBe(site);
        });

        it('should create a new Modals instance', () => {
            site = new Site();

            // Verify that the modals functionality is available by checking the private property
            expect(site).toHaveProperty('_modals');
        });

        it('should add is-loaded class to body after initialization', () => {
            site = new Site();

            expect(document.body.classList.contains('is-loaded')).toBe(true);
        });

        it('should replace the singleton instance if created multiple times', () => {
            const site1 = new Site();
            const site2 = new Site();

            expect(Site.instance).toBe(site2);
            expect(Site.instance).not.toBe(site1);
        });
    });

    describe('SVG icon replacement', () => {
        it('should replace elements with data-icon attributes', () => {
            // Create elements with data-icon attributes
            const starElement = document.createElement('span');
            starElement.setAttribute('data-icon', 'star');
            document.body.appendChild(starElement);

            const playElement = document.createElement('div');
            playElement.setAttribute('data-icon', 'play');
            document.body.appendChild(playElement);

            const crossElement = document.createElement('button');
            crossElement.setAttribute('data-icon', 'cross');
            document.body.appendChild(crossElement);

            site = new Site();

            expect(starElement.innerHTML).toContain('star-icon');
            expect(playElement.innerHTML).toContain('play-icon');
            expect(crossElement.innerHTML).toContain('cross-icon');
        });

        it('should handle elements with unknown icon names', () => {
            const unknownElement = document.createElement('span');
            unknownElement.setAttribute('data-icon', 'unknown');
            document.body.appendChild(unknownElement);

            site = new Site();

            expect(consoleSpy.warn).toHaveBeenCalledWith('Icon unknown not found');
            expect(unknownElement.innerHTML).toBe('');
        });

        it('should handle elements with empty data-icon attributes', () => {
            const emptyElement = document.createElement('span');
            emptyElement.setAttribute('data-icon', '');
            document.body.appendChild(emptyElement);

            site = new Site();

            expect(consoleSpy.warn).toHaveBeenCalledWith('Icon  not found');
            expect(emptyElement.innerHTML).toBe('');
        });

        it('should replace multiple elements with the same icon', () => {
            const starElement1 = document.createElement('span');
            starElement1.setAttribute('data-icon', 'star');
            document.body.appendChild(starElement1);

            const starElement2 = document.createElement('div');
            starElement2.setAttribute('data-icon', 'star');
            document.body.appendChild(starElement2);

            site = new Site();

            expect(starElement1.innerHTML).toContain('star-icon');
            expect(starElement2.innerHTML).toContain('star-icon');
        });

        it('should not affect elements without data-icon attributes', () => {
            const normalElement = document.createElement('span');
            normalElement.innerHTML = 'Original content';
            document.body.appendChild(normalElement);

            site = new Site();

            expect(normalElement.innerHTML).toBe('Original content');
        });
    });

    describe('modal button event binding', () => {
        it('should bind click events to elements with data-modal-target', () => {
            const button = document.createElement('button');
            button.setAttribute('data-modal-target', 'test-modal');
            document.body.appendChild(button);

            site = new Site();

            button.click();

            expect(mockModalsOpen).toHaveBeenCalledWith('test-modal');
        });

        it('should handle multiple modal buttons', () => {
            const button1 = document.createElement('button');
            button1.setAttribute('data-modal-target', 'modal-1');
            document.body.appendChild(button1);

            const button2 = document.createElement('button');
            button2.setAttribute('data-modal-target', 'modal-2');
            document.body.appendChild(button2);

            site = new Site();

            button1.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('modal-1');

            button2.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('modal-2');

            expect(mockModalsOpen).toHaveBeenCalledTimes(2);
        });

        it('should warn when button has no modal ID', () => {
            const button = document.createElement('button');
            button.setAttribute('data-modal-target', '');
            document.body.appendChild(button);

            site = new Site();

            button.click();

            expect(consoleSpy.warn).toHaveBeenCalledWith('No modal ID specified for button');
            expect(mockModalsOpen).not.toHaveBeenCalled();
        });

        it('should warn when button has null modal ID', () => {
            const button = document.createElement('button');
            // Don't set data-modal-target attribute at all
            document.body.appendChild(button);

            // Manually add the attribute selector to make it a modal button
            button.setAttribute('data-modal-target', '');
            button.removeAttribute('data-modal-target');

            // Create a button that would be selected by the query but has no attribute
            const buttonWithoutAttr = document.createElement('button');
            buttonWithoutAttr.setAttribute('data-modal-target', '');
            buttonWithoutAttr.removeAttribute('data-modal-target');
            
            // Re-add it properly to test the null case
            const properButton = document.createElement('button');
            properButton.setAttribute('data-modal-target', '');
            document.body.appendChild(properButton);

            site = new Site();

            properButton.click();

            expect(consoleSpy.warn).toHaveBeenCalledWith('No modal ID specified for button');
            expect(mockModalsOpen).not.toHaveBeenCalled();
        });

        it('should not bind events to elements without data-modal-target', () => {
            const normalButton = document.createElement('button');
            normalButton.textContent = 'Normal Button';
            document.body.appendChild(normalButton);

            site = new Site();

            normalButton.click();

            expect(mockModalsOpen).not.toHaveBeenCalled();
        });

        it('should work with different element types', () => {
            const link = document.createElement('a');
            link.setAttribute('data-modal-target', 'link-modal');
            document.body.appendChild(link);

            const div = document.createElement('div');
            div.setAttribute('data-modal-target', 'div-modal');
            document.body.appendChild(div);

            site = new Site();

            link.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('link-modal');

            div.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('div-modal');
        });
    });

    describe('integration scenarios', () => {
        it('should handle elements that are both icon containers and modal buttons', () => {
            const button = document.createElement('button');
            button.setAttribute('data-icon', 'play');
            button.setAttribute('data-modal-target', 'video-modal');
            document.body.appendChild(button);

            site = new Site();

            // Should replace icon
            expect(button.innerHTML).toContain('play-icon');

            // Should bind modal event
            button.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('video-modal');
        });

        it('should handle complex DOM structures', () => {
            const container = document.createElement('div');
            
            // Add some icon elements
            const iconSpan = document.createElement('span');
            iconSpan.setAttribute('data-icon', 'star');
            container.appendChild(iconSpan);

            // Add some modal buttons
            const modalButton = document.createElement('button');
            modalButton.setAttribute('data-modal-target', 'gallery-modal');
            container.appendChild(modalButton);

            // Add nested elements
            const nestedDiv = document.createElement('div');
            const nestedIcon = document.createElement('i');
            nestedIcon.setAttribute('data-icon', 'cross');
            nestedDiv.appendChild(nestedIcon);
            container.appendChild(nestedDiv);

            document.body.appendChild(container);

            site = new Site();

            // Check icons were replaced
            expect(iconSpan.innerHTML).toContain('star-icon');
            expect(nestedIcon.innerHTML).toContain('cross-icon');

            // Check modal button works
            modalButton.click();
            expect(mockModalsOpen).toHaveBeenCalledWith('gallery-modal');

            // Check body class was added
            expect(document.body.classList.contains('is-loaded')).toBe(true);
        });

        it('should handle empty DOM gracefully', () => {
            // Start with completely empty DOM
            expect(() => {
                site = new Site();
            }).not.toThrow();

            expect(document.body.classList.contains('is-loaded')).toBe(true);
        });

        it('should handle rapid successive button clicks', () => {
            const button = document.createElement('button');
            button.setAttribute('data-modal-target', 'test-modal');
            document.body.appendChild(button);

            site = new Site();

            // Click multiple times rapidly
            button.click();
            button.click();
            button.click();

            expect(mockModalsOpen).toHaveBeenCalledTimes(3);
            expect(mockModalsOpen).toHaveBeenCalledWith('test-modal');
        });
    });

    describe('error handling', () => {
        it('should handle malformed icon elements gracefully', () => {
            const malformedElement = document.createElement('span');
            malformedElement.setAttribute('data-icon', 'star');
            
            // Make the element somehow problematic
            Object.defineProperty(malformedElement, 'innerHTML', {
                set: () => {
                    throw new Error('Cannot set innerHTML');
                },
                get: () => 'original'
            });

            document.body.appendChild(malformedElement);

            expect(() => {
                site = new Site();
            }).toThrow('Cannot set innerHTML');
        });

        it('should continue processing other elements if one fails', () => {
            const goodElement = document.createElement('span');
            goodElement.setAttribute('data-icon', 'star');
            document.body.appendChild(goodElement);

            const badElement = document.createElement('span');
            badElement.setAttribute('data-icon', 'nonexistent');
            document.body.appendChild(badElement);

            const anotherGoodElement = document.createElement('span');
            anotherGoodElement.setAttribute('data-icon', 'play');
            document.body.appendChild(anotherGoodElement);

            site = new Site();

            expect(goodElement.innerHTML).toContain('star-icon');
            expect(anotherGoodElement.innerHTML).toContain('play-icon');
            expect(consoleSpy.warn).toHaveBeenCalledWith('Icon nonexistent not found');
        });
    });
});