DO
$$
BEGIN
	IF register_patch('AddCallInternalEndDateCalls.sql', 'Farai Mutambara', 'Add end_call_internal date to calls', '2022-08-22') THEN
        BEGIN

            -- add end_call_internal column to call table
            ALTER TABLE "call" 
            ADD COLUMN IF NOT EXISTS end_call_internal TIMESTAMPTZ DEFAULT NOW();

            -- update end_call_internal column
            UPDATE "call"  SET end_call_internal = ( call.end_call );

             -- remove Default value from end_call_internal column
            ALTER TABLE "call" ALTER COLUMN end_call_internal DROP DEFAULT;
        END;
	END IF;
END;
$$
LANGUAGE plpgsql;