DO
$$
BEGIN
    IF register_patch('ExperimentSafetyInput.sql', 'Jekabs Karklins', 'Replacing risk assessments with experiment safety input #SWAP-1835', '2021-09-17') THEN

        DROP TABLE risk_assessments_has_samples; -- Cleaning up old data
        DROP TABLE risk_assessments;             -- Cleaning up old data

        DELETE FROM visits;                      -- Cleaning up old data

        CREATE TABLE experiment_safety_inputs (
            esi_id serial PRIMARY KEY
            , visit_id INT REFERENCES visits(visit_id) ON DELETE CASCADE
            , creator_user_id int REFERENCES users(user_id)
            , questionary_id int UNIQUE REFERENCES questionaries(questionary_id) ON UPDATE CASCADE
            , is_submitted BOOLEAN DEFAULT FALSE
            , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        ); 


        CREATE TABLE sample_experiment_safety_inputs (
            sample_esi_id serial PRIMARY KEy,
            esi_id int REFERENCES experiment_safety_inputs(esi_id) ON DELETE CASCADE ,
            sample_id int REFERENCES samples(sample_id) ON DELETE CASCADE ,
            questionary_id INTEGER REFERENCES questionaries (questionary_id),
            is_submitted BOOLEAN DEFAULT FALSE
        ); 

        /* Clean up questionary if experiment_safety_inputs is deleted */
        CREATE OR REPLACE FUNCTION after_esi_delete() RETURNS trigger AS $body$
            BEGIN
                DELETE FROM 
                    questionaries
                WHERE
                    questionary_id = old.questionary_id;
            RETURN old;
            END;
            $body$ LANGUAGE 'plpgsql';


        CREATE TRIGGER after_experiment_safety_inputs_delete_trigger AFTER DELETE ON "experiment_safety_inputs"
        FOR EACH ROW EXECUTE PROCEDURE after_esi_delete();

        CREATE TRIGGER after_sample_experiment_safety_inputs_delete_trigger AFTER DELETE ON "sample_experiment_safety_inputs"
        FOR EACH ROW EXECUTE PROCEDURE after_esi_delete();
        /* End cleanup*/

        UPDATE question_datatypes set question_datatype_id='PROPOSAL_ESI_BASIS' WHERE question_datatype_id='RISK_ASSESSMENT_BASIS';
        UPDATE questions set question_id='proposal_esi_basis', natural_key='Proposal ESI', question='Proposal ESI basis' WHERE question_id='risk_assessment_basis';

        ALTER table call ADD COLUMN esi_template_id INTEGER DEFAULT NULL REFERENCES templates (template_id);

    END IF;
END;
$$
LANGUAGE plpgsql;