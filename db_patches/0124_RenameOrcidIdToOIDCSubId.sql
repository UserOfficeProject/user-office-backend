DO
$$
BEGIN
    IF register_patch('RenameOrcidIdToOidcSub.sql', 'Jekabs Karklins', 'Rename orcid to oidc_sub', '2022-07-07') THEN

        ALTER TABLE "users"
        RENAME COLUMN orcid TO oidc_sub;

        ALTER TABLE "users"
        RENAME COLUMN orcid_refreshtoken TO oidc_refresh_token;

        /* Token sizes set to standart sizes https://developers.google.com/identity/protocols/oauth2#size */
        ALTER TABLE "users" ALTER COLUMN oidc_refresh_token TYPE varchar(512);

        ALTER TABLE "users"
        ADD COLUMN oidc_access_token VARCHAR(2048);

    END IF;
END;
$$
LANGUAGE plpgsql;