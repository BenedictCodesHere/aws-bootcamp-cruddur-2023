export default function FormErrorItem(props) {
  const render_error = () => {
    switch (props.err_code) {
      case 'generic_500':
        return "An internal server error has occurred";
      case 'generic_403':
        return "You are not authorized to perform this action";
      case 'generic_401':
        return "You are not authenticated to perform this action";
      case 'cognito_user_id_blank':
        return "The user was not provided";
      case 'activity_uuid_blank':
        return "The post id cannot be blank";
      case 'message_blank':
        return "The message cannot be blank";
      case 'message_exceed_max_chars_1024':
        return "The message is too long, It should be less than 1024 characters";
      case 'message_group_uuid_blank':
        return "The message group cannot be blank";
      case 'user_receiver_handle_blank':
        return "You need to send a message to a valid user";
      case 'display_name_blank':
        return "The display name cannot be blank";
      default:
        return props.err_code;
    }
  };

  return (
    <div className="errorItem">
      {render_error()}
    </div>
  );
}
