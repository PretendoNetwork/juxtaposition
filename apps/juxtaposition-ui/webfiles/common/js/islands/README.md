# About islands

The Juxtaposition frontend code uses the [Islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) but in a slightly different way.


## What are islands

Islands are tiny modules that add interactivity to otherwise static HTML.
Because of the limitations of the older consoles we can't use a full frontend framework like React. The CPU simply can't keep up and it relies on too modern JS features.

With those limitations, we have to be very specific where we use JS. That's why the islands architecture fits well:
It only applies JS to specific parts of a page.


## Differences from standard islands

Usually islands are associated with using full React or Vue components on an otherwise static page.
Our islands are different: We rely on data attributes and selectors to add interactivity using plain JS.
