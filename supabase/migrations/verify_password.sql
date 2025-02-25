
CREATE OR REPLACE FUNCTION verify_password(input_password text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$;
