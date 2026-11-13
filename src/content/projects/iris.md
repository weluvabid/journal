---
id: iris
title: 'Iris'
summary: 'A reusable UI foundation built around accessible primitives, consistent interaction patterns and practical component composition.'
status: released
tags: [svelte, typescript, tailwind-css, design-systems, accessibility]
stack: [Svelte, TypeScript, Tailwind CSS]
github: 'https://github.com/weluvabid/iris'
featured: true
order: 3
---

## Overview

A Svelte UI base so the same components aren't copied between repos. Not an application framework. Composable pieces, styling conventions, and a small demo. Branding stays in the product.

Restrained on purpose. Monochrome, light and dark. Tailwind is the styling vocabulary. Interaction primitives come from shadcn-svelte. Focus and keyboard behavior are a bad thing to reimplement from scratch.

## Engineering notes

Iris owns reusable interaction. It doesn't own routing, global state, or a product's information architecture. Callers compose content, change links, and adapt layout without dropping the accessible behavior.

A component that only runs inside this repository isn't reusable yet. Stable exports, deliberate peer dependencies, reproducible build output, a clean install somewhere else. Published to npm. 0.4.1 is the point where that stopped being a local folder.

The demo checks installation, composition, and theming. It should stay smaller than the library, not turn into a second product. Lint, format, types, and release automation protect the same boundary as the exports.


## What to explore

- The component exports and their composition patterns.
- The use of shadcn-svelte primitives rather than reimplementing interaction behaviour.
- Theme-aware, monochrome styling and the separation of shared UI from product branding.
- The package build and published npm distribution.
- The consuming projects that demonstrate how the foundation is reused.
