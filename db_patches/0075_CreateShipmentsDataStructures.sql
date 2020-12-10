DO
$$
BEGIN
	IF register_patch('CreateShipmentsTable.sql', 'jekabskarklins', 'Create shipments table', '2020-12-08') THEN
	BEGIN

      CREATE TABLE shipments (
            shipment_id serial PRIMARY KEY
          , title VARCHAR(500) NOT NULL DEFAULT ''
          , proposal_id int REFERENCES proposals(proposal_id) ON DELETE CASCADE
          , questionary_id int REFERENCES questionaries(questionary_id)
          , creator_id int REFERENCES users (user_id)
          , created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); 

      ALTER TABLE samples 
      ADD COLUMN shipment_id INT NULL REFERENCES template_categories(template_category_id) DEFAULT NULL;

      INSERT INTO template_categories(name) VALUES('Shipment declaration');

      INSERT INTO question_datatypes(question_datatype_id) VALUES('SHIPMENT_BASIS');

          INSERT INTO questions(
            question_id,
            data_type,
            question,
            default_config,
            natural_key,
            category_id
        )
    VALUES(
            'shipment_basis',
            'SHIPMENT_BASIS',
            'Shipment basic information',
            '{"required":false,"small_label":"","tooltip":""}',
            'shipment_basis',
            3
        );

    END;
	END IF;
END;
$$
LANGUAGE plpgsql;