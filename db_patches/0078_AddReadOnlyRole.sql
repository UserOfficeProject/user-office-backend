DO
$$
BEGIN
	IF register_patch('AddApiPermissions.sql', 'martintrajanovski', 'Api permissions to be able to control the access to the api', '2021-01-26') THEN
	  BEGIN
			CREATE TABLE IF NOT EXISTS api_permissions (
				api_permission_id SERIAL PRIMARY KEY,
				access_token VARCHAR(64) NOT NULL,
				access_permissions jsonb
			);
    END;
	END IF;
END;
$$
LANGUAGE plpgsql;