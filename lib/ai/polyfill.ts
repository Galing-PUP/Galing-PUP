// Polyfill for DOMMatrix (Missing in Node/Bun environment)
if (typeof global.DOMMatrix === "undefined") {
    // Basic mock since we only need text extraction, not rendering
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { return this; }
        toString() { return ""; }
        // Add minimal required methods if it crashes on others
        multiply() { return this; }
        translate() { return this; }
        scale() { return this; }
    };
}
