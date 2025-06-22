import type { RenderContext } from "@/services/juxt-web/views/context";
import { WebNavBar } from "@/services/juxt-web/views/web/navbar";
import { WebRoot } from "@/services/juxt-web/views/web/root";
import moment from "moment";
import type { ReactNode } from "react";

type ConversationModel = any; // types not yet known

export type MessagesViewProps = {
  ctx: RenderContext;
  conversations: ConversationModel[];
};

export function WebMessagesView(props: MessagesViewProps): ReactNode {
  return (
    <WebRoot>
      <h2 id="title" className="page-header">
        {props.ctx.lang.global.messages}
      </h2>
      <WebNavBar ctx={props.ctx} selection={3} />
      <div id="toast"></div>
      <div id="wrapper">
        {props.conversations.length === 0 ? (
          <li style={{ listStyle: "none" }}>
            <p>{props.ctx.lang.messages.coming_soon}</p>
          </li>
        ) : (
          <ul
            className="list-content-with-icon-and-text arrow-list"
            id="news-list-content"
          >
            {props.conversations.map((convo) => {
              let userObj, me;
              if (convo.users[0].pid === props.ctx.pid) {
                userObj = convo.users[1];
                me = convo.users[0];
              } else if (convo.users[1].pid === props.ctx.pid) {
                userObj = convo.users[0];
                me = convo.users[1];
              }
              return (
                <li>
                  <div className="hover">
                    <a
                      href={`/users/${userObj.pid}`}
                      data-pjax="#body"
                      className="icon-container notify"
                    >
                      <img
                        src={`${props.ctx.cdnUrl}/mii/${userObj.pid}/normal_face.png`}
                        className="icon"
                      />
                    </a>
                    <a
                      className="body messages"
                      href={`/friend_messages/${convo.id}`}
                    >
                      <span className="text">
                        <span className="nick-name">
                          {props.ctx.usersMap.get(userObj.pid)}
                        </span>
                        <span className="timestamp">
                          @{props.ctx.usersMap.get(userObj.pid)}
                        </span>
                      </span>
                      <span className="text">
                        <span className="link"> {convo.message_preview}</span>
                        <span className="timestamp">
                          {" - "}
                          {moment(convo.last_updated).fromNow()}
                        </span>
                      </span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </WebRoot>
  );
}
