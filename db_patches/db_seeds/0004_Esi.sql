DO
$DO$
BEGIN

	INSERT INTO public.templates(
		name, description, is_archived, group_id)
		VALUES ('default ESI template', '', false, 'PROPOSAL_ESI');

	UPDATE public.call
		SET esi_template_id=(
			SELECT template_id from public.templates WHERE name='default ESI template'
		)


	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('Default ESI template', 'Default ESI template', false, 'PROPOSAL_ESI');

	INSERT INTO templates(name, description, is_archived, group_id) VALUES 
	('Default sample ESI template', 'Default sample ESI template', false, 'SAMPLE_ESI');

END;
$DO$
LANGUAGE plpgsql;

