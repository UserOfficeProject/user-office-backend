DO
$$
BEGIN
	IF register_patch('MigrateFileUploadAnswers.sql', 'martintrajanovski', 'Migrate file_upload answers to support new structure with captions', '2021-02-05') THEN
	  BEGIN
      UPDATE answers
      SET answer = JSONB_SET(answer,'{value}',src.new_json)
      FROM (
        SELECT answer_id, 
          JSONB_AGG(
            (SELECT TO_JSONB(_) FROM (SELECT id) AS _)
          ) new_json
        FROM (
          SELECT answer_id, JSONB_ARRAY_ELEMENTS(answer->'value') AS id
          FROM answers
        ) src
        GROUP BY src.answer_id
      ) src
      WHERE answers.answer_id = src.answer_id
      AND answers.question_id LIKE 'file_upload_%';
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;