DO
$$
BEGIN
    IF register_patch('MergeRiskAssessmentsWithVisits.sql', 'Jekabs Karklins', 'Merging risk assessment with visits #SWAP-1835', '2021-09-17') THEN

        DROP TABLE risk_assessments_has_samples; -- Cleaning up old data
        DROP TABLE risk_assessments;             -- Cleaning up old data

        DELETE FROM visits;                      -- Cleaning up old data

        CREATE TABLE visits_has_samples (
            visit_id int REFERENCES visits(visit_id) ON DELETE CASCADE ,
            sample_id int REFERENCES samples(sample_id) ON DELETE CASCADE ,
            esi_questionary_id INTEGER REFERENCES questionaries (questionary_id),
            is_esi_submitted BOOLEAN DEFAULT FALSE
        ); 

        ALTER TABLE visits ADD COLUMN esi_questionary_id INTEGER REFERENCES questionaries (questionary_id);
        ALTER TABLE visits ADD COLUMN is_esi_submitted BOOLEAN DEFAULT FALSE;

    END IF;
END;
$$
LANGUAGE plpgsql;