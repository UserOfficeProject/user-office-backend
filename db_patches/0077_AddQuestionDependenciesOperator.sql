DO
$$
BEGIN
	IF register_patch('AddQuestionDependencies.sql', 'martintrajanovski', 'Store question dependencies in their own table so we can have multiple dependencies on one question.', '2021-01-12') THEN
	  BEGIN
			ALTER TABLE templates_has_questions ADD COLUMN dependencies_operator VARCHAR(64) DEFAULT 'AND';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;