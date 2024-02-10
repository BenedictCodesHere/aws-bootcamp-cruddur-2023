import './ProfileHeading.css';
import EditProfileButton from '../components/EditProfileButton';

export default function ProfileHeading(props) {
  return (
    <div className='activity_feed_profile_heading'>
        <div className='title'>{props.profile.display_name}</div>
        <div className="cruds_count">{`${props.profile.cruds_count} cruds`}</div>

        <div className="avatar">
            <img src="https://assets.cruddurclone.com/avatars/data.jpg" alt="avatar"/>
        </div>
        <div className="display_name">{props.display_name}</div>
        <div className="handle">@{props.handle}</div>

        <EditProfileButton setPopped={props.setPopped} />
    </div>
  );
}