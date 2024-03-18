import './HomeFeedPage.css';
import React from "react";

import {ReactComponent as Logo} from '../components/svg/logo.svg';
import DesktopNavigation  from 'components/DesktopNavigation';
import DesktopSidebar     from 'components/DesktopSidebar';
import ActivityFeed from 'components/ActivityFeed';
import ActivityForm from 'components/ActivityForm';
import ReplyForm from 'components/ReplyForm';
import {get} from 'lib/Requests';
import {checkAuth} from 'lib/CheckAuth';
// import { useNavigate } from 'react-router-dom';


export default function HomeFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [popped, setPopped] = React.useState(false);
  const [poppedReply, setPoppedReply] = React.useState(false);
  const [replyActivity, setReplyActivity] = React.useState({});
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  // const navigate = useNavigate();
	// const goBack = () => {
	// 	navigate(-1);
	// }

  const loadData = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/home`
    get(url,{
      auth: true,
      success: function(data){
        setActivities(data)
      }
    })
  }
// check if we are authenticated


// check when the page loads if we are authenicated
  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth(setUser);
    
  }, [])
  
  // If user is logged out, only render the Nav bar and the Join Sidebar.
  if(!user){
    return <div className='content-wrapper'>
     <article className='noauth-landing'>
      <div className='noauth-landing-logo-wrapper'>
        <Logo />
      </div>
      {/* <DesktopNavigation user={user} active={'home'} setPopped={setPopped} /> */}
      <DesktopSidebar user={user} />
    </article>
    </div>
  } else {
    return (
      <div className='content-wrapper'>
        <article>
          <DesktopNavigation user={user} active={'home'} setPopped={setPopped} />
          <div className='content'>
            <ActivityForm  
              popped={popped}
              setPopped={setPopped} 
              setActivities={setActivities} 
              user={user}
            />
            <ReplyForm 
              activity={replyActivity} 
              popped={poppedReply} 
              setPopped={setPoppedReply}
            />
            <div className='activity_feed'>
              <div className='activity_feed_heading'>
                
                <div className='title'>Home</div>
              </div>
              <ActivityFeed 
                setReplyActivity={setReplyActivity} 
                setPopped={setPoppedReply} 
                activities={activities} 
              />
            </div>
          {/* Sidebar currently showing outdated display_name. Working on a fix for this - see Journal/Week12-post-week  */}
          </div>
          
        </article>
        <DesktopSidebar user={user} />
      </div>
    );
  }
}