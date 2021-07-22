DO
$$
BEGIN
	IF register_patch('AddingNewUser.sql', 'Jekabs Karklins', 'Add new user', '2021-07-22') THEN
		BEGIN
		  
            INSERT INTO users (
                            user_title, 
                            firstname, 
                            middlename, 
                            lastname, 
                            username, 
                            password,
                            preferredname,
                            orcid,
                            orcid_refreshToken,
                            gender,
                            nationality,
                            birthdate,
                            organisation,
                            department,
                            organisation_address,
                            position,
                            email,
                            email_verified,
                            telephone,
                            telephone_alt
                            ) 
            VALUES 
                            (
                            'Mr.', 
                            'David',
                            'David', 
                            'Dawson', 
                            'testuser4', 
                            '$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm',
                            'David',
                            '123123123',
                            '581459604',
                            'male',
                            'Austrian',
                            '1995-04-01',
                            'Silverwoods',
                            'Maxillofacial surgeon',
                            'Bahngasse 20, 9441 GRABERN',
                            'Management',
                            'david@teleworm.us',
                            true,
                            '0676 472 14 66',
                            '0676 159 94 87'
                            );

            INSERT INTO role_user (role_id, user_id) VALUES (1, 6);

		END;
	END IF;
END;
$$
LANGUAGE plpgsql;
