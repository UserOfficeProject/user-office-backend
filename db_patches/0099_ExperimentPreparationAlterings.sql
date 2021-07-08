DO
$$
BEGIN
	IF register_patch('ExperimentPreparationAlterings.sql', 'jekabskarklins', 'Add column scheduled_event_id to visits table', '2021-06-02') THEN
	BEGIN

        DELETE FROM visits; /* Delete all existing visits, because visit must have associated event_id */
		ALTER TABLE visits ADD COLUMN scheduled_event_id INTEGER NOT NULL;

		ALTER TABLE visits_has_users ADD COLUMN registration_questionary_id INTEGER REFERENCES questionaries(questionary_id) DEFAULT NULL;
		ALTER TABLE visits_has_users ADD COLUMN training_expiry_date TIMESTAMPTZ DEFAULT NULL;

		ALTER TABLE proposals ADD COLUMN risk_assessment_questionary_id INTEGER REFERENCES questionaries(questionary_id) DEFAULT NULL;
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;
