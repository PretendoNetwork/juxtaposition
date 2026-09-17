# Juxtaposition markdown

Juxtaposition markdown is a subset of normal markdown, it supports the following:
- Bold: `**bold**` and `__bold__` turns into <kbd>**bold**</kbd>
- Italics: `*italic*` and `_italic_` turns into <kbd>*italic*</kbd>
- Strikethrough: `~~strikethrough~~` turns into <kbd>~~strikethrough~~</kbd>
- Inline code: `` `code` `` turns into <kbd>`code`</kbd>
- Newlines: Using a newline turns it into a proper new line. This is unusual in markdown, but is more intuitive for users.
- Paragraphs: Using two newlines in a row turns it into a new paragraph

There's also custom syntax:
- Mentions: `@pnid` Turns into `<@1262353>` (the PID), which gets rendered as a real mention.
  - **Note:** This doesn't exist yet, still working on it.

## Processing stack

The processing of markdown is split into two distinct pipelines:
1. Transformation
2. Rendering

This split exists so we can add custom syntax that needs to be pre-processed

### Processing / Transformation

This needs to be ran on any user input before it gets stored or rendered.

To run it, just do:
```ts
const output = await transformJuxtMarkdown(input, {
    ... // Add options here
})
```
It takes a markdown string and outputs another markdown string.


### Processing / Rendering

To display a markdown string, you just got to call a render function using the output of `parseJuxtMarkdown`:
```ts
const ast = parseJuxtMarkdown(input);
const plaintext = renderToPlainText(ast);
```

To render in HTML, loop over the AST directly and render it as you'd want.
