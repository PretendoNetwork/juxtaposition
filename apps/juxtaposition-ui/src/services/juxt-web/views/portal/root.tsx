import type { ReactNode } from "react";

function DefaultHead(): ReactNode {
  return (
    <>
      <link rel="stylesheet" type="text/css" href="/css/juxt.css" />
      <script src="/js/debug.global.js"></script>
      <script src="/js/juxt.global.js"></script>
    </>
  );
}

export type HtmlProps = {
  children?: ReactNode;
  head?: ReactNode;
  title?: string;
};

export function PortalRoot(props: HtmlProps): ReactNode {
  return (
    <html lang="en">
      <head>
        <DefaultHead />
        {props.title ? <title>{props.title}</title> : null}
        {props.head}
      </head>
      <body>
        <div id="body">{props.children}</div>
      </body>
    </html>
  );
}

export function PortalPageBody(props: { children?: ReactNode }): ReactNode {
  return <div id="body">{props.children}</div>;
}
