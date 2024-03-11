from lib.db import db

class ReplyToActivityUuidToUuidMigration:
    @staticmethod
    def migrate_sql():
        data = """
        -- Add a new UUID column for replies
        ALTER TABLE activities ADD COLUMN new_reply_to_activity_uuid UUID;
        
        -- Assuming there's no direct mapping from old integer IDs to new UUIDs,
        -- and since existing data might not correspond to actual UUIDs in users table,
        -- you might need to set them as NULL or map them to existing activities UUIDs
        -- Here, we're setting them to NULL for simplicity
        UPDATE activities SET new_reply_to_activity_uuid = NULL;
        
        -- Drop the old column
        ALTER TABLE activities DROP COLUMN reply_to_activity_uuid;
        
        -- Rename the new column to match the old column's name
        ALTER TABLE activities RENAME COLUMN new_reply_to_activity_uuid TO reply_to_activity_uuid;
        
        -- Add a foreign key constraint (if necessary, adjust according to your schema)
        ALTER TABLE activities ADD CONSTRAINT activities_reply_to_activity_uuid_fkey 
        FOREIGN KEY (reply_to_activity_uuid) REFERENCES activities(uuid);
        """
        return data

    @staticmethod
    def rollback_sql():
        data = """
        -- To rollback, we'll need to remove the foreign key constraint first
        ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_reply_to_activity_uuid_fkey;
        
        -- Add a temporary integer column for rollback
        ALTER TABLE activities ADD COLUMN old_reply_to_activity_uuid INTEGER;
        
        -- You cannot automatically convert UUIDs to integers, so we set them as NULL or map them appropriately
        UPDATE activities SET old_reply_to_activity_uuid = NULL;
        
        -- Remove the current UUID column
        ALTER TABLE activities DROP COLUMN reply_to_activity_uuid;
        
        -- Rename the old integer column back
        ALTER TABLE activities RENAME COLUMN old_reply_to_activity_uuid TO reply_to_activity_uuid;
        """
        return data

    @staticmethod
    def migrate():
        db.query_commit(ReplyToActivityUuidToUuidMigration.migrate_sql())

    @staticmethod
    def rollback():
        db.query_commit(ReplyToActivityUuidToUuidMigration.rollback_sql())

migration = ReplyToActivityUuidToUuidMigration()
