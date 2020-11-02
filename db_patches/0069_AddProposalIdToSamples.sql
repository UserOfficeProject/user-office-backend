DO
$$
BEGIN
  IF register_patch('AddProposalIdToSamples.sql', 'Peter Asztalos', 'Add proposal events table to keep track of all fired events on a proposal.', '2020-10-22') THEN
    BEGIN

    ALTER TABLE "samples" ADD "proposal_id" int DEFAULT NULL;

    ALTER TABLE "samples" ADD CONSTRAINT samples_proposal_id_fkey 
      FOREIGN KEY ("proposal_id") 
      REFERENCES "proposals" ("proposal_id")
      ON DELETE CASCADE;

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;