import Button from '@app/components/Common/Button';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import defineMessages from '@app/utils/defineMessages';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import * as Yup from 'yup';

const messages = defineMessages('components.Login.Signup', {
  createAccount: 'Create Trial Account',
  username: 'Username',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  email: 'Email',
  emailOptional: 'Email (Optional)',
  validationUsernameRequired: 'Username is required',
  validationUsernameFormat: 'Username can only contain letters, numbers, hyphens, and underscores',
  validationPasswordRequired: 'Password is required',
  validationPasswordLength: 'Password must be at least 6 characters',
  validationPasswordMatch: 'Passwords must match',
  validationEmailInvalid: 'Invalid email address',
  signupError: 'Something went wrong while creating your account.',
  usernameExists: 'This username is already taken.',
  signupDisabled: 'Account creation is currently disabled.',
  creatingAccount: 'Creating Account…',
  createMyAccount: 'Create My Account',
  trialInfo: 'Your account will have {trialDays} days of free access to the media library.',
  backToLogin: 'Back to Login',
  accountCreated: 'Account created successfully! Redirecting...',
});

interface JellyfinSignupProps {
  revalidate: () => void;
  onBackToLogin: () => void;
}

const JellyfinSignup: React.FC<JellyfinSignupProps> = ({
  revalidate,
  onBackToLogin,
}) => {
  const toasts = useToasts();
  const intl = useIntl();

  const SignupSchema = Yup.object().shape({
    username: Yup.string()
      .required(intl.formatMessage(messages.validationUsernameRequired))
      .matches(
        /^[a-zA-Z0-9_-]+$/,
        intl.formatMessage(messages.validationUsernameFormat)
      ),
    password: Yup.string()
      .required(intl.formatMessage(messages.validationPasswordRequired))
      .min(6, intl.formatMessage(messages.validationPasswordLength)),
    confirmPassword: Yup.string()
      .required(intl.formatMessage(messages.validationPasswordRequired))
      .oneOf(
        [Yup.ref('password')],
        intl.formatMessage(messages.validationPasswordMatch)
      ),
    email: Yup.string().email(intl.formatMessage(messages.validationEmailInvalid)),
  });

  return (
    <div>
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
        }}
        validationSchema={SignupSchema}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const response = await axios.post('/api/v1/auth/jellyfin/signup', {
              username: values.username,
              password: values.password,
              email: values.email || undefined,
            });

            toasts.addToast(
              intl.formatMessage(messages.accountCreated),
              {
                autoDismiss: true,
                appearance: 'success',
              }
            );

            // Wait a moment then redirect
            setTimeout(() => {
              revalidate();
            }, 1000);
          } catch (e) {
            let errorMessage = messages.signupError;

            if (e?.response?.status === 409) {
              errorMessage = messages.usernameExists;
            } else if (e?.response?.status === 403) {
              errorMessage = messages.signupDisabled;
            } else if (e?.response?.data?.message) {
              toasts.addToast(e.response.data.message, {
                autoDismiss: true,
                appearance: 'error',
              });
              return;
            }

            toasts.addToast(intl.formatMessage(errorMessage), {
              autoDismiss: true,
              appearance: 'error',
            });
          }
        }}
      >
        {({ errors, touched, isSubmitting, isValid }) => {
          return (
            <>
              <Form data-form-type="signup">
                <div>
                  <h2 className="mb-2 -mt-1 text-center text-lg font-bold text-neutral-200">
                    {intl.formatMessage(messages.createAccount)}
                  </h2>
                  <p className="mb-6 text-center text-xs text-slate-400">
                    {intl.formatMessage(messages.trialInfo, { trialDays: 7 })}
                  </p>

                  <div className="mb-4">
                    <div className="form-input-field">
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        placeholder={intl.formatMessage(messages.username)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                        data-form-type="username"
                      />
                    </div>
                    {errors.username && touched.username && (
                      <div className="error">{errors.username}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="form-input-field">
                      <SensitiveInput
                        as="field"
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={intl.formatMessage(messages.password)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                        data-form-type="password"
                        data-1pignore="false"
                        data-lpignore="false"
                      />
                    </div>
                    {errors.password && touched.password && (
                      <div className="error">{errors.password}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="form-input-field">
                      <SensitiveInput
                        as="field"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder={intl.formatMessage(messages.confirmPassword)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                        data-form-type="password"
                        data-1pignore="false"
                        data-lpignore="false"
                      />
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="error">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="form-input-field">
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder={intl.formatMessage(messages.emailOptional)}
                        className="!bg-gray-700/80 placeholder:text-gray-400"
                        data-form-type="email"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <div className="error">{errors.email}</div>
                    )}
                  </div>
                </div>

                <Button
                  buttonType="primary"
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="mt-2 w-full shadow-sm"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  <span>
                    {isSubmitting
                      ? intl.formatMessage(messages.creatingAccount)
                      : intl.formatMessage(messages.createMyAccount)}
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="mt-4 w-full text-center text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  {intl.formatMessage(messages.backToLogin)}
                </button>
              </Form>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default JellyfinSignup;
