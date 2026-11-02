import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  FORGOT_PASSWORD_MUTATION,
  LOGIN_MUTATION,
  RESET_PASSWORD_MUTATION,
  SEND_VERIFICATION_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_TOKEN_MUTATION,
  USER_FIELDS,
  VERIFY_MAIL_MUTATION,
} from './AuthMutations';

describe('USER_FIELDS', () => {
  it('selects core user, profile, department, position and cvs fields', () => {
    const source = print(USER_FIELDS);

    expect(source).toContain('fragment UserFields on User');
    expect(source).toContain('is_verified');
    expect(source).toContain('full_name');
    expect(source).toContain('department');
    expect(source).toContain('position');
    expect(source).toContain('cvs');
  });
});

describe('LOGIN_MUTATION / SIGNUP_MUTATION', () => {
  it('returns tokens and spreads UserFields', () => {
    const login = print(LOGIN_MUTATION);
    const signup = print(SIGNUP_MUTATION);

    expect(login).toContain('mutation Login');
    expect(login).toContain('login(auth: $auth)');
    expect(login).toContain('access_token');
    expect(login).toContain('refresh_token');
    expect(login).toContain('...UserFields');

    expect(signup).toContain('mutation Signup');
    expect(signup).toContain('signup(auth: $auth)');
    expect(signup).toContain('...UserFields');
  });
});

describe('password and verification mutations', () => {
  it('defines forgot / reset / verify / sendVerification / updateToken', () => {
    expect(print(FORGOT_PASSWORD_MUTATION)).toContain('mutation ForgotPassword');
    expect(print(FORGOT_PASSWORD_MUTATION)).toContain('forgotPassword(auth: $auth)');

    expect(print(RESET_PASSWORD_MUTATION)).toContain('mutation ResetPassword');
    expect(print(RESET_PASSWORD_MUTATION)).toContain('resetPassword(auth: $auth)');

    expect(print(VERIFY_MAIL_MUTATION)).toContain('mutation VerifyMail');
    expect(print(VERIFY_MAIL_MUTATION)).toContain('verifyMail(mail: $mail)');

    expect(print(SEND_VERIFICATION_MUTATION)).toContain('mutation SendVerification');
    expect(print(SEND_VERIFICATION_MUTATION)).toContain('sendVerification(email: $email)');

    const updateToken = print(UPDATE_TOKEN_MUTATION);
    expect(updateToken).toContain('mutation UpdateToken');
    expect(updateToken).toContain('access_token');
    expect(updateToken).toContain('refresh_token');
  });
});
