import './MessageFeed.css';
import MessageItem from './MessageItem';

export default function MessageFeed(props) {
  return (
    <div className='message_feed'>
      <div className='message_feed_heading'>
        <div className='title'>Conversation</div>
      </div>
      <div className='message_feed_collection'>
        {props.messages && props.messages.map(message => {
        return  <MessageItem key={message.uuid} message={message} />
        })
        }
      </div>
    </div>
  );
}