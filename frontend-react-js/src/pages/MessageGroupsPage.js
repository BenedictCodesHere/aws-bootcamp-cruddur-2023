import './MessageGroupsPage.css';
import React from "react";

import DesktopNavigation  from '../components/DesktopNavigation';
import MessageGroupFeed from '../components/MessageGroupFeed';
import {checkAuth} from '../lib/CheckAuth';
import {get} from 'lib/Requests';
import { eventWrapper } from '@testing-library/user-event/dist/utils';
// import { useNavigate } from 'react-router-dom'

  
export default function MessageGroupsPage() {
  const [messageGroups, setMessageGroups] = React.useState([]);
  const [popped, setPopped] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  


  const loadData = async () => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/message_groups`
    get(url,{
      auth: true,
      success: function(data){
        setMessageGroups(data)
      }
    })
  }

  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth(setUser);
  }, [])

  // const navigate = useNavigate();
	// const goBack = () => {
	// 	navigate(-1);
	// }
  
  return (
    <div className='content-wrapper'>
      <article>
        
        <DesktopNavigation user={user} active={'messages'} setPopped={setPopped} />
        
        <section className='message_groups'>
        
          <MessageGroupFeed message_groups={messageGroups} />
          
        </section>
        {/* <div className='content'>
          
        </div> */}
        
      </article>
    </div>
  );
}