import type { ReactNode } from "react";

export function InlineScript(props: { src: string }): ReactNode {
  return <script dangerouslySetInnerHTML={{ __html: props.src }} />;
}

export function InlineStyle(props: { src: string }): ReactNode {
  return <style dangerouslySetInnerHTML={{ __html: props.src }} />;
}
