import EmbyLogo from '@app/assets/services/emby-icon-only.svg';
import JellyfinLogo from '@app/assets/services/jellyfin-icon.svg';
import PlexLogo from '@app/assets/services/plex.svg';
import Button from '@app/components/Common/Button';
import ImageFader from '@app/components/Common/ImageFader';
import PageTitle from '@app/components/Common/PageTitle';
import LanguagePicker from '@app/components/Layout/LanguagePicker';
import JellyfinLogin from '@app/components/Login/JellyfinLogin';
import LocalLogin from '@app/components/Login/LocalLogin';
import PlexLoginButton from '@app/components/Login/PlexLoginButton';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { MediaServerType } from '@server/constants/server';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import useSWR from 'swr';

const messages = defineMessages('components.Login', {
  signin: 'Sign In',
  signinheader: 'Sign in to continue',
  signinwithplex: 'Use your Plex account',
  signinwithjellyfin: 'Use your {mediaServerName} account',
  signinwithoverseerr: 'Use your {applicationTitle} account',
  orsigninwith: 'Or sign in with',
});

const DiscordIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#5865F2]"
  >
    <path
      d="M20.317 4.369A19.791 19.791 0 0 0 15.892 3l-.213.426c2.18.544 3.182 1.326 4.242 2.309-.908-.46-1.814-.77-2.72-.972a13.26 13.26 0 0 0-6.196 0c-.907.202-1.813.512-2.72.972 1.06-.982 2.062-1.765 4.242-2.309L12.106 3a19.79 19.79 0 0 0-4.425 1.369C4.74 7.042 4.07 9.613 4.27 12.143c.925 1.39 2.276 2.445 3.698 3.285A10.3 10.3 0 0 0 9.4 16.38l.469-.982c-.863-.321-1.69-.744-2.454-1.26l.614-.384c1.663.774 3.46 1.171 5.261 1.171s3.598-.397 5.262-1.17l.613.383c-.764.516-1.591.939-2.454 1.26l.469.982c.982-.325 1.93-.754 2.848-1.253 1.422-.84 2.773-1.895 3.698-3.285.3-3.26-.55-5.773-3.349-7.774ZM9.97 13.798c-.82 0-1.488-.726-1.488-1.613 0-.886.657-1.614 1.488-1.614.83 0 1.498.728 1.488 1.614 0 .887-.657 1.613-1.488 1.613Zm4.06 0c-.82 0-1.488-.726-1.488-1.613 0-.886.657-1.614 1.488-1.614.83 0 1.498.728 1.488 1.614 0 .887-.657 1.613-1.488 1.613Z"
      fill="currentColor"
    />
  </svg>
);

const Login = () => {
  const intl = useIntl();
  const router = useRouter();
  const settings = useSettings();
  const { user, revalidate } = useUser();

  const [error, setError] = useState('');
  const [isProcessing, setProcessing] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [mediaServerLogin, setMediaServerLogin] = useState(
    settings.currentSettings.mediaServerLogin
  );

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to sign in. If we get a success message, we will
  // ask swr to revalidate the user which _should_ come back with a valid user.
  useEffect(() => {
    const login = async () => {
      setProcessing(true);
      try {
        const response = await axios.post('/api/v1/auth/plex', { authToken });

        if (response.data?.id) {
          revalidate();
        }
      } catch (e) {
        setError(e.response?.data?.message);
        setAuthToken(undefined);
        setProcessing(false);
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, revalidate]);

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we redirect the user to the home page as the login was successful.
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const { data: backdrops } = useSWR<string[]>('/api/v1/backdrops', {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
  });

  const mediaServerName =
    settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? 'Plex'
      : settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
      ? 'Jellyfin'
      : settings.currentSettings.mediaServerType === MediaServerType.EMBY
      ? 'Emby'
      : undefined;

  const MediaServerLogo =
    settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? PlexLogo
      : settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
      ? JellyfinLogo
      : settings.currentSettings.mediaServerType === MediaServerType.EMBY
      ? EmbyLogo
      : undefined;

  const isJellyfin =
    settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN ||
    settings.currentSettings.mediaServerType === MediaServerType.EMBY;
  const mediaServerLoginRef = useRef<HTMLDivElement>(null);
  const localLoginRef = useRef<HTMLDivElement>(null);
  const loginRef = mediaServerLogin ? mediaServerLoginRef : localLoginRef;

  const loginFormVisible =
    (isJellyfin && settings.currentSettings.mediaServerLogin) ||
    settings.currentSettings.localLogin;
  const additionalLoginOptions = [
    settings.currentSettings.mediaServerLogin &&
      (settings.currentSettings.mediaServerType === MediaServerType.PLEX ? (
        <PlexLoginButton
          key="plex"
          isProcessing={isProcessing}
          onAuthToken={(authToken) => setAuthToken(authToken)}
          large={!isJellyfin && !settings.currentSettings.localLogin}
        />
      ) : (
        settings.currentSettings.localLogin &&
        (mediaServerLogin ? (
          <button
            key="seerr"
            data-testid="seerr-login-button"
            className="flex-1 rounded-xl border border-[#2f3245] bg-[#0f111a] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#5865f2] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            onClick={() => setMediaServerLogin(false)}
          >
            <span className="flex items-center justify-center gap-2">
              <DiscordIcon />
              <span>Login with Discord</span>
            </span>
          </button>
        ) : (
          <Button
            key="mediaserver"
            data-testid="mediaserver-login-button"
            className="flex-1 bg-transparent"
            onClick={() => setMediaServerLogin(true)}
          >
            <MediaServerLogo />
            <span>{mediaServerName}</span>
          </Button>
        ))
      )),
  ].filter((o): o is JSX.Element => !!o);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#06060b] px-4 py-10">
      <PageTitle title={intl.formatMessage(messages.signin)} />
      <ImageFader
        backgroundImages={
          backdrops?.map(
            (backdrop) => `https://image.tmdb.org/t/p/original${backdrop}`
          ) ?? []
        }
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(93,176,255,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(177,89,255,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(37,222,164,0.08),transparent_35%),linear-gradient(180deg,#06060b_0%,#06060b_100%)]" />

      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <div className="absolute left-4 bottom-4 z-50 flex items-center gap-3 text-xs text-slate-400">
        <a
          href="https://apexnova.live/wiki"
          className="underline decoration-slate-500 decoration-dotted underline-offset-4 transition hover:text-white"
        >
          Apex Nova Wiki
        </a>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-500">
          v1
        </span>
      </div>

      <div className="relative z-40 mb-8 flex flex-col items-center text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative h-16 w-28">
          <Image
            src="/logo_full.png"
            alt="Logo"
            fill
            style={{ objectFit: 'contain' }}
            sizes="112px"
          />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Apex Nova Access
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Secure sign-in with media server or Discord. No fluff—just your queue.
        </p>
      </div>

      <div className="relative z-50 w-full max-w-xl sm:max-w-md">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_35px_90px_rgba(0,0,0,0.7)] backdrop-blur">
          <>
            <Transition
              as="div"
              show={!!error}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="h-5 w-5" />
                  <h3 className="text-sm font-semibold">{error}</h3>
                </div>
              </div>
            </Transition>
            <div className="px-8 py-8 sm:px-10">
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={mediaServerLogin ? 'ms' : 'local'}
                  nodeRef={loginRef}
                  addEndListener={(done) => {
                    loginRef.current?.addEventListener(
                      'transitionend',
                      done,
                      false
                    );
                  }}
                  onEntered={() => {
                    document
                      .querySelector<HTMLInputElement>('#email, #username')
                      ?.focus();
                  }}
                  classNames={{
                    appear: 'opacity-0',
                    appearActive: 'transition-opacity duration-500 opacity-100',
                    enter: 'opacity-0',
                    enterActive: 'transition-opacity duration-500 opacity-100',
                    exitActive: 'transition-opacity duration-0 opacity-0',
                  }}
                >
                  <div ref={loginRef} className="button-container space-y-4">
                    {isJellyfin &&
                    (mediaServerLogin ||
                      !settings.currentSettings.localLogin) ? (
                      <JellyfinLogin
                        serverType={settings.currentSettings.mediaServerType}
                        revalidate={revalidate}
                      />
                    ) : (
                      settings.currentSettings.localLogin && (
                        <LocalLogin revalidate={revalidate} />
                      )
                    )}
                  </div>
                </CSSTransition>
              </SwitchTransition>

              {additionalLoginOptions.length > 0 &&
                (loginFormVisible ? (
                  <div className="flex items-center py-5">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="mx-2 flex-shrink text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {intl.formatMessage(messages.orsigninwith)}
                    </span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>
                ) : (
                  <h2 className="mb-6 text-center text-lg font-semibold text-neutral-200">
                    {intl.formatMessage(messages.signinheader)}
                  </h2>
                ))}

              <div
                className={`flex w-full flex-wrap gap-2 ${
                  !loginFormVisible ? 'flex-col' : ''
                }`}
              >
                {additionalLoginOptions}
              </div>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Login;
