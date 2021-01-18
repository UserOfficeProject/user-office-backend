DO
$$
BEGIN
	IF register_patch('AddInstrumentSubmittedToInstrumentHasProposals.sql', 'martintrajanovski', 'Add submitted flag in instrument_has_proposals', '2020-08-26') THEN
	BEGIN

      ALTER TABLE instrument_has_proposals ADD COLUMN submitted BOOLEAN DEFAULT FALSE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;