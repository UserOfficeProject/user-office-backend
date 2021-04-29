DO
$$
BEGIN
	IF register_patch('AddBeamlineManagerToInstrumentsTable.sql', 'jekabskarklins', 'Add responsible person named Beamline manager for each instrument', '2021-04-28') THEN

        ALTER TABLE instruments ADD COLUMN manager_user_id INTEGER REFERENCES users (user_id) DEFAULT null;

	END IF;
END;
$$
LANGUAGE plpgsql;