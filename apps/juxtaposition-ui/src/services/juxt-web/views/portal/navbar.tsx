import type { RenderContext } from "@/services/juxt-web/views/context";
import type { ReactNode } from "react";

export type NavBarProps = {
  ctx: RenderContext;
  selection: number;
};

export function PortalNavBar(props: NavBarProps): ReactNode {
  const selectedClasses = (id: number) =>
    id === props.selection ? "selected" : "";

  return (
    <menu id="nav-menu">
      <li id="nav-menu-me" data-tab="me" className={selectedClasses(0)}>
        <a href="/users/me" data-pjax="#body" data-sound="SE_WAVE_MENU">
          <span className="mii-icon">
            <img
              src={`${props.ctx.cdnUrl}/mii/${props.ctx.pid}/normal_face.png`}
              alt="User Page"
            />
          </span>
          <span>{props.ctx.lang.global.user_page}</span>
        </a>
      </li>
      <li id="nav-menu-feed" data-tab="feed" className={selectedClasses(1)}>
        <a href="/feed" data-pjax="#body" data-sound="SE_WAVE_MENU">
          {props.ctx.lang.global.activity_feed}
        </a>
      </li>
      <li
        id="nav-menu-community"
        data-tab="titles"
        className={selectedClasses(2)}
      >
        <a href="/titles" data-pjax="#body" data-sound="SE_WAVE_MENU">
          {props.ctx.lang.global.communities}
        </a>
      </li>
      <li
        id="nav-menu-message"
        data-tab="message"
        className={selectedClasses(3)}
      >
        <a href="/friend_messages" data-pjax="#body" data-sound="SE_WAVE_MENU">
          {props.ctx.lang.global.messages}
          <span id="message-badge" className="badge">
            0
          </span>
        </a>
      </li>
      <li id="nav-menu-news" data-tab="news" className={selectedClasses(4)}>
        <a href="/news/my_news" data-pjax="#body" data-sound="SE_WAVE_MENU">
          {props.ctx.lang.global.notifications}
          <span id="news-badge" className="badge">
            0
          </span>
        </a>
      </li>
      <li id="nav-menu-exit" onclick="exit()">
        <a role="button" data-sound="SE_WAVE_EXIT">
          {props.ctx.lang.global.close}
        </a>
      </li>
      <li id="nav-menu-back" className="none" onclick="back()">
        <a role="button" className="accesskey-B" data-sound="SE_WAVE_BACK">
          {props.ctx.lang.global.go_back}
        </a>
      </li>
    </menu>
  );
}
