DO
$$
BEGIN
    IF register_patch('AddFacilities.sql', 'Cosimo Campo', 'Add facilities to the app', '2022-02-07') THEN

    CREATE TABLE IF NOT EXISTS facility (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS call_has_facilities (
      call_id SERIAL REFERENCES call(call_id),
      facility_id SERIAL REFERENCES facility(id),
      availability_time INTEGER,
      CONSTRAINT call_has_facilities_pkey PRIMARY KEY (facility_id, call_id)
    );

    END IF;
END;
$$
LANGUAGE plpgsql;
