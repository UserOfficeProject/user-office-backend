DO
$DO$
BEGIN

  INSERT INTO instruments (instrument_id, name, short_code, description) VALUES (1, 'Instrument 1', 'INSTR1', 'Test instrument 1');
  INSERT INTO instruments (instrument_id, name, short_code, description) VALUES (2, 'Instrument 2', 'INSTR2', 'Test instrument 2');
  INSERT INTO instruments (instrument_id, name, short_code, description) VALUES (3, 'Instrument 3', 'INSTR3', 'Test instrument 3');
  
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time, submitted) VALUES (1, 1, NULL, false);
  INSERT INTO call_has_instruments (call_id, instrument_id, availability_time, submitted) VALUES (1, 3, NULL, false);

  INSERT INTO questionaries(questionary_id, template_id, created_at, creator_id) VALUES (1, 1, NOW(), 1);

  INSERT INTO proposals 
    (
       proposal_id
     , title
     , abstract
     , status_id
     , proposer_id
     , created_at
     , updated_at
     , short_code
     , final_status
     , call_id
     , questionary_id
     , comment_for_management
     , comment_for_user
     , notified
     , submitted
    )
    VALUES 
    (
       1                  -- proposal_id
     , 'Test proposal'    -- title
     , 'Lorem ipsum'      -- abstract
     , 8                  -- status_id
     , 1                  -- proposer_id
     , NOW()              -- created_at
     , NOW()              -- updated_at
     , '999999'           -- short_code
     , 1                  -- final_status
     , 1                  -- call_id
     , 1                  -- questionary_id
     , NULL               -- comment_for_management
     , NULL               -- comment_for_user
     , true               -- notified
     , true               -- submitted
    );

  INSERT INTO instrument_has_proposals(instrument_id, proposal_id) VALUES (1, 1);

  INSERT INTO technical_review (technical_review_id, proposal_id, comment, time_allocation, status, public_comment) VALUES (1, 1, '', 2, 0, '');

END;
$DO$
LANGUAGE plpgsql;
