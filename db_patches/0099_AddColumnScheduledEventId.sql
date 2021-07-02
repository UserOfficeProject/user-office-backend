DO
$$
BEGIN
	IF register_patch('AddColumnScheduledEventId.sql', 'jekabskarklins', 'Add column scheduled_event_id to visits table', '2021-06-02') THEN
	BEGIN

        DELETE FROM visits; /* Delete all existing visits, because visit must have associated event_id */
		ALTER TABLE visits ADD COLUMN scheduled_event_id INTEGER NOT NULL;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
