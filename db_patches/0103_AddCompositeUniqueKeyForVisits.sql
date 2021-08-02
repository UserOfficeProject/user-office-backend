DO
$$
BEGIN
	IF register_patch('AddCompositeUniqueKeyForVisits.sql', 'Jekabs Karklins', 'Add composite primary key for visits', '2021-08-02') THEN
		BEGIN
			DROP INDEX visits_proposal_pk;
			ALTER TABLE visits add CONSTRAINT visits_proposal_pk_scheduled_event_id UNIQUE (proposal_pk, scheduled_event_id);
		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
