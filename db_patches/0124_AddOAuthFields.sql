DO
$$
BEGIN
    IF register_patch('AddOAuthFields.sql', 'Jekabs Karklins', 'Add OAuth fields', '2022-07-07') THEN

        ALTER TABLE "users"
        RENAME COLUMN orcid TO oidc_sub;

        ALTER TABLE "users"
        RENAME COLUMN orcid_refreshtoken TO oidc_refresh_token;

        /* Token sizes set to standart sizes https://developers.google.com/identity/protocols/oauth2#size */
        ALTER TABLE "users" ALTER COLUMN oidc_refresh_token TYPE varchar(512);
        ALTER TABLE users ALTER COLUMN oidc_refresh_token DROP NOT NULL;
        

        ALTER TABLE "users"
        ADD COLUMN oidc_access_token VARCHAR(2048);

        /* Update developmment entries */
        UPDATE "users" SET oidc_access_token = '$2a$10$1svMW3/1234567890.vwm', oidc_refresh_token='$2a$10$1svMW3/1234567890.vwm', oidc_sub='Javon4.oauthsub' WHERE email = 'Javon4@hotmail.com';
        UPDATE "users" SET oidc_access_token = '$2a$10$1svMW3/1234567890.vwm', oidc_refresh_token='$2a$10$1svMW3/1234567890.vwm', oidc_sub='Aaron_Harris49.oauthsub' WHERE email = 'Aaron_Harris49@gmail.com';
        UPDATE "users" SET oidc_access_token = '$2a$10$1svMW3/1234567890.vwm', oidc_refresh_token='$2a$10$1svMW3/1234567890.vwm', oidc_sub='nils.oauthsub' WHERE email = 'nils@ess.se';
        UPDATE "users" SET oidc_access_token = '$2a$10$1svMW3/1234567890.vwm', oidc_refresh_token='$2a$10$1svMW3/1234567890.vwm', oidc_sub='ben.oauthsub' WHERE email = 'ben@inbox.com';
        UPDATE "users" SET oidc_access_token = '$2a$10$1svMW3/1234567890.vwm', oidc_refresh_token='$2a$10$1svMW3/1234567890.vwm', oidc_sub='david.oauthsub' WHERE email = 'david@teleworm.us';
        UPDATE "users" SET oidc_access_token = NULL, oidc_refresh_token=NULL, oidc_sub='david.oauthsub' WHERE email = 'unverified-user@example.com';

    END IF;
END;
$$
LANGUAGE plpgsql;