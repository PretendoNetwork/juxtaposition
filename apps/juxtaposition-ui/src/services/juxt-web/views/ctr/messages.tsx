import type { ReactNode } from "react";
import type {
  ConversationUserModel,
  MessagesViewProps,
} from "@/services/juxt-web/views/web/messages";
import moment from "moment";
import cx from "classnames";

export function CtrMessagesView(props: MessagesViewProps): ReactNode {
  return (
    <ul
      className="list-content-with-icon-column arrow-list"
      id="news-list-content"
    >
      {props.conversations.length === 0 ? (
        <p className="no-posts-text">{props.ctx.lang.messages.coming_soon}</p>
      ) : (
        props.conversations.map((convo) => {
          let userObj: ConversationUserModel | null = null;
          let me: ConversationUserModel | null = null;
          if (convo.users[0].pid === props.ctx.pid) {
            userObj = convo.users[1];
            me = convo.users[0];
          } else if (convo.users[1].pid === props.ctx.pid) {
            userObj = convo.users[0];
            me = convo.users[1];
          }
          if (!me || !userObj) return null;
          if (!userObj.pid || !me.pid) return null; // Prevent rendering with incomplete data

          return (
            <li>
              <a
                href={`/users/${userObj.pid}`}
                data-pjax="#body"
                className={cx("icon-container", {
                  verified: userObj.official,
                })}
              >
                <img
                  src={`${props.ctx.cdnUrl}/mii/${userObj.pid}/normal_face.png`}
                  className="icon"
                />
              </a>
              <a
                href={`/friend_messages/${convo.id}`}
                data-pjax="#body"
                className="arrow-button"
              ></a>
              <div className="body message">
                <p>
                  <span className="nick-name">
                    {props.ctx.usersMap.get(userObj.pid)}
                  </span>
                  <span className="id-name">
                    @{props.ctx.usersMap.get(userObj.pid)}
                  </span>
                  <span> {convo.message_preview}</span>
                  <span className="timestamp">
                    {" "}
                    {moment(convo.last_updated).fromNow()}
                  </span>
                </p>
              </div>
            </li>
          );
        })
      )}
    </ul>
  );
}
