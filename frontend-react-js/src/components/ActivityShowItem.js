import './ActivityShowItem.css';

import ActivityContent from './ActivityContent';
import ActivityActionReply  from '../components/ActivityActionReply';
import ActivityActionRepost  from '../components/ActivityActionRepost';
import ActivityActionLike  from '../components/ActivityActionLike';
import ActivityActionShare  from '../components/ActivityActionShare';

import { Link } from "react-router-dom";
import { format_datetime, time_ago, time_future } from '../lib/DateTimeFormats';
import {ReactComponent as BombIcon} from './svg/bomb.svg';

export default function ActivityShowItem(props) {

  const attrs = {}
  attrs.className = 'activity_item expanded'
  return (
    <div {...attrs}>
      <div className="activity_main">
        <ActivityContent activity={props.activity} />
        <div className='expandedMeta'>
          <div className="created_at">
            {format_datetime(props.activity.created_at)}
          </div>
        </div>
        <div className="activity_actions">
          <ActivityActionReply setReplyActivity={props.setReplyActivity} activity={props.activity} setPopped={props.setPopped} activity_uuid={props.activity.uuid} count={props.activity.replies_count}/>
          <ActivityActionRepost activity_uuid={props.activity.uuid} count={props.activity.reposts_count}/>
          <ActivityActionLike activity_uuid={props.activity.uuid} count={props.activity.likes_count}/>
          <ActivityActionShare activity_uuid={props.activity.uuid} />
        </div>
      </div>
    </div>
  )
}