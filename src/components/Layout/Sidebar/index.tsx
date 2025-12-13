import Badge from '@app/components/Common/Badge';
import UserWarnings from '@app/components/Layout/UserWarnings';
import useClickOutside from '@app/hooks/useClickOutside';
import { Permission, useUser } from '@app/hooks/useUser';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import {
  BookOpenIcon,
  ClockIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FilmIcon,
  SparklesIcon,
  TvIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

export const menuMessages = defineMessages('components.Layout.Sidebar', {
  dashboard: 'Discover',
  browsemovies: 'Movies',
  browsetv: 'Series',
  browseebooks: 'Ebooks',
  requests: 'Requests',
  blacklist: 'Blacklist',
  issues: 'Issues',
  users: 'Users',
  settings: 'Settings',
});

const menuDescriptions = defineMessages(
  'components.Layout.Sidebar.Descriptions',
  {
    discover: 'Browse all available content',
    movies: 'Find and request movies',
    tv: 'Browse TV Shows',
    ebooks: 'Browse ebook library',
    requests: 'Track your media requests',
    issues: 'Your reported issues',
  }
);

interface SidebarProps {
  open?: boolean;
  setClosed: () => void;
  pendingRequestsCount: number;
  openIssuesCount: number;
  revalidateIssueCount: () => void;
  revalidateRequestsCount: () => void;
}

interface SidebarLinkProps {
  href: string;
  svgIcon: React.ReactNode;
  messagesKey: keyof typeof menuMessages;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
  descriptionKey?: keyof typeof menuDescriptions;
}

const SidebarBrowseLinks: SidebarLinkProps[] = [
  {
    href: '/',
    messagesKey: 'dashboard',
    descriptionKey: 'discover',
    svgIcon: <SparklesIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/(discover\/?)?$/,
  },
  {
    href: '/discover/movies',
    messagesKey: 'browsemovies',
    descriptionKey: 'movies',
    svgIcon: <FilmIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/discover\/movies$/,
  },
  {
    href: '/discover/tv',
    messagesKey: 'browsetv',
    descriptionKey: 'tv',
    svgIcon: <TvIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/discover\/tv$/,
  },
  {
    href: '/discover/ebooks',
    messagesKey: 'browseebooks',
    descriptionKey: 'ebooks',
    svgIcon: <BookOpenIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/discover\/ebooks$/,
  },
];

const SidebarActivityLinks: SidebarLinkProps[] = [
  {
    href: '/requests',
    messagesKey: 'requests',
    descriptionKey: 'requests',
    svgIcon: <ClockIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/requests/,
  },
  {
    href: '/issues',
    messagesKey: 'issues',
    descriptionKey: 'issues',
    svgIcon: <ExclamationTriangleIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/issues/,
    requiredPermission: [
      Permission.MANAGE_ISSUES,
      Permission.CREATE_ISSUES,
      Permission.VIEW_ISSUES,
    ],
    permissionType: 'or',
  },
];

const SidebarAdminLinks: SidebarLinkProps[] = [
  {
    href: '/blacklist',
    messagesKey: 'blacklist',
    svgIcon: <EyeSlashIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/blacklist/,
    requiredPermission: [
      Permission.MANAGE_BLACKLIST,
      Permission.VIEW_BLACKLIST,
    ],
    permissionType: 'or',
  },
  {
    href: '/users',
    messagesKey: 'users',
    svgIcon: <UsersIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
    dataTestId: 'sidebar-menu-users',
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    svgIcon: <CogIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/settings/,
    requiredPermission: Permission.ADMIN,
    dataTestId: 'sidebar-menu-settings',
  },
];

const Sidebar = ({
  open,
  setClosed,
  pendingRequestsCount,
  openIssuesCount,
  revalidateIssueCount,
  revalidateRequestsCount,
}: SidebarProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();
  useClickOutside(navRef, () => setClosed());

  useEffect(() => {
    if (openIssuesCount) {
      revalidateIssueCount();
    }

    if (pendingRequestsCount) {
      revalidateRequestsCount();
    }
  }, [
    revalidateIssueCount,
    revalidateRequestsCount,
    pendingRequestsCount,
    openIssuesCount,
  ]);

  return (
    <>
      <div className="lg:hidden">
        <Transition as={Fragment} show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as="div"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-black/80"></div>
              </div>
            </Transition.Child>
            <Transition.Child
              as="div"
              enter="transition-transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div className="sidebar relative flex h-full w-full max-w-xs flex-1 flex-col">
                  <div className="sidebar-close-button absolute right-0 -mr-14 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-[#16161f] focus:bg-[#16161f] focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex flex-1 flex-col overflow-y-auto pt-4 pb-8 sm:pb-4"
                  >
                    <div className="flex flex-shrink-0 items-center px-2">
                      <span className="w-full px-4 text-xl text-gray-50">
                        <Link href="/" className="relative block h-16 w-32">
                          <Image
                            src="/logo_full.png"
                            alt="Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="128px"
                          />
                        </Link>
                      </span>
                    </div>
                    <nav className="mt-10 flex-1 space-y-6 px-4">
                      <div>
                        <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Browse Media
                        </div>
                        <div className="space-y-3">
                          {SidebarBrowseLinks.filter((link) =>
                            link.requiredPermission
                              ? hasPermission(link.requiredPermission, {
                                  type: link.permissionType ?? 'and',
                                })
                              : true
                          ).map((sidebarLink) => {
                            return (
                              <Link
                                key={`mobile-${sidebarLink.messagesKey}`}
                                href={sidebarLink.href}
                                as={sidebarLink.as}
                                onClick={() => setClosed()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setClosed();
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                className={`group flex items-center rounded-2xl border px-4 py-3 text-base font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                      ${
                        router.pathname.match(sidebarLink.activeRegExp)
                          ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                          : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                      }`}
                                data-testid={`${sidebarLink.dataTestId}-mobile`}
                              >
                                <div className="mr-2 text-xl text-inherit">
                                  {sidebarLink.svgIcon}
                                </div>
                                <div className="flex flex-col text-left leading-5">
                                  <span
                                    className={`text-base font-semibold ${
                                      router.pathname.match(
                                        sidebarLink.activeRegExp
                                      )
                                        ? 'text-[#0b0b0f]'
                                        : 'text-inherit'
                                    }`}
                                  >
                                    {intl.formatMessage(
                                      menuMessages[sidebarLink.messagesKey]
                                    )}
                                  </span>
                                  {sidebarLink.descriptionKey && (
                                    <span
                                      className={`text-xs font-medium ${
                                        router.pathname.match(
                                          sidebarLink.activeRegExp
                                        )
                                          ? 'text-slate-600'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {intl.formatMessage(
                                        menuDescriptions[
                                          sidebarLink.descriptionKey
                                        ]
                                      )}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Your Activity
                        </div>
                        {SidebarActivityLinks.filter((link) =>
                          link.requiredPermission
                            ? hasPermission(link.requiredPermission, {
                                type: link.permissionType ?? 'and',
                              })
                            : true
                        ).map((sidebarLink) => {
                          return (
                            <Link
                              key={`mobile-${sidebarLink.messagesKey}`}
                              href={sidebarLink.href}
                              as={sidebarLink.as}
                              onClick={() => setClosed()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setClosed();
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`group flex items-center rounded-2xl border px-4 py-3 text-base font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                      ${
                        router.pathname.match(sidebarLink.activeRegExp)
                          ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                          : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                      }`}
                              data-testid={`${sidebarLink.dataTestId}-mobile`}
                            >
                              <div className="mr-2 text-xl text-inherit">
                                {sidebarLink.svgIcon}
                              </div>
                              <div className="flex flex-col text-left leading-5">
                                <span
                                  className={`text-base font-semibold ${
                                    router.pathname.match(
                                      sidebarLink.activeRegExp
                                    )
                                      ? 'text-[#0b0b0f]'
                                      : 'text-inherit'
                                  }`}
                                >
                                  {intl.formatMessage(
                                    menuMessages[sidebarLink.messagesKey]
                                  )}
                                </span>
                                {sidebarLink.descriptionKey && (
                                  <span
                                    className={`text-xs font-medium ${
                                      router.pathname.match(
                                        sidebarLink.activeRegExp
                                      )
                                        ? 'text-slate-600'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {intl.formatMessage(
                                      menuDescriptions[
                                        sidebarLink.descriptionKey
                                      ]
                                    )}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="space-y-3">
                        <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Admin
                        </div>
                        {SidebarAdminLinks.filter((link) =>
                          link.requiredPermission
                            ? hasPermission(link.requiredPermission, {
                                type: link.permissionType ?? 'and',
                              })
                            : true
                        ).map((sidebarLink) => {
                          return (
                            <Link
                              key={`mobile-${sidebarLink.messagesKey}`}
                              href={sidebarLink.href}
                              as={sidebarLink.as}
                              onClick={() => setClosed()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setClosed();
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`group flex items-center rounded-2xl border px-4 py-3 text-base font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                        ${
                          router.pathname.match(sidebarLink.activeRegExp)
                            ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                            : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                        }`}
                              data-testid={`${sidebarLink.dataTestId}-mobile`}
                            >
                              <div className="mr-2 text-xl text-inherit">
                                {sidebarLink.svgIcon}
                              </div>
                              <div className="flex flex-col text-left leading-5">
                                <span
                                  className={`text-base font-semibold ${
                                    router.pathname.match(
                                      sidebarLink.activeRegExp
                                    )
                                      ? 'text-[#0b0b0f]'
                                      : 'text-inherit'
                                  }`}
                                >
                                  {intl.formatMessage(
                                    menuMessages[sidebarLink.messagesKey]
                                  )}
                                </span>
                                {sidebarLink.descriptionKey && (
                                  <span
                                    className={`text-xs font-medium ${
                                      router.pathname.match(
                                        sidebarLink.activeRegExp
                                      )
                                        ? 'text-slate-600'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {intl.formatMessage(
                                      menuDescriptions[
                                        sidebarLink.descriptionKey
                                      ]
                                    )}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </nav>
                    <div className="px-2">
                      <UserWarnings onClick={() => setClosed()} />
                    </div>
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition.Child>
          </div>
        </Transition>
      </div>

      <div className="fixed top-0 bottom-0 left-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="sidebar flex w-64 flex-col">
          <div className="flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4">
              <div className="flex flex-shrink-0 items-center">
                <span className="w-full px-4 py-2 text-2xl text-gray-50">
                  <Link href="/" className="relative block h-16 w-32">
                    <Image
                      src="/logo_full.png"
                      alt="Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="128px"
                    />
                  </Link>
                </span>
              </div>
              <nav className="mt-8 flex-1 space-y-6 px-4">
                <div>
                  <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Browse Media
                  </div>
                  <div className="space-y-3">
                    {SidebarBrowseLinks.filter((link) =>
                      link.requiredPermission
                        ? hasPermission(link.requiredPermission, {
                            type: link.permissionType ?? 'and',
                          })
                        : true
                    ).map((sidebarLink) => {
                      return (
                        <Link
                          key={`desktop-${sidebarLink.messagesKey}`}
                          href={sidebarLink.href}
                          as={sidebarLink.as}
                          className={`group flex items-center rounded-2xl border px-4 py-3 text-lg font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                        ${
                          router.pathname.match(sidebarLink.activeRegExp)
                            ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                            : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                        }`}
                          data-testid={sidebarLink.dataTestId}
                        >
                          <div className="mr-2 text-xl text-inherit">
                            {sidebarLink.svgIcon}
                          </div>
                          <div className="flex flex-col text-left leading-6">
                            <span
                              className={`text-base font-semibold ${
                                router.pathname.match(sidebarLink.activeRegExp)
                                  ? 'text-[#0b0b0f]'
                                  : 'text-inherit'
                              }`}
                            >
                              {intl.formatMessage(
                                menuMessages[sidebarLink.messagesKey]
                              )}
                            </span>
                            {sidebarLink.descriptionKey && (
                              <span
                                className={`text-xs font-medium ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'text-slate-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {intl.formatMessage(
                                  menuDescriptions[sidebarLink.descriptionKey]
                                )}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Your Activity
                  </div>
                  {SidebarActivityLinks.filter((link) =>
                    link.requiredPermission
                      ? hasPermission(link.requiredPermission, {
                          type: link.permissionType ?? 'and',
                        })
                      : true
                  ).map((sidebarLink) => {
                    return (
                      <Link
                        key={`desktop-${sidebarLink.messagesKey}`}
                        href={sidebarLink.href}
                        as={sidebarLink.as}
                        className={`group flex items-center rounded-2xl border px-4 py-3 text-lg font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                        ${
                          router.pathname.match(sidebarLink.activeRegExp)
                            ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                            : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                        }`}
                        data-testid={sidebarLink.dataTestId}
                      >
                        {sidebarLink.svgIcon}
                        {intl.formatMessage(
                          menuMessages[sidebarLink.messagesKey]
                        )}
                        {sidebarLink.messagesKey === 'requests' &&
                          pendingRequestsCount > 0 &&
                          hasPermission(Permission.MANAGE_REQUESTS) && (
                            <div className="ml-auto flex">
                              <Badge
                                className={`rounded-md bg-gradient-to-br ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'border-emerald-500 from-emerald-500 to-cyan-500'
                                    : 'border-emerald-400 from-emerald-400 to-cyan-500'
                                }`}
                              >
                                {pendingRequestsCount}
                              </Badge>
                            </div>
                          )}
                        {sidebarLink.messagesKey === 'issues' &&
                          openIssuesCount > 0 &&
                          hasPermission(Permission.MANAGE_ISSUES) && (
                            <div className="ml-auto flex">
                              <Badge
                                className={`rounded-md bg-gradient-to-br ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'border-emerald-500 from-emerald-500 to-cyan-500'
                                    : 'border-emerald-400 from-emerald-400 to-cyan-500'
                                }`}
                              >
                                {openIssuesCount}
                              </Badge>
                            </div>
                          )}
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Admin
                  </div>
                  {SidebarAdminLinks.filter((link) =>
                    link.requiredPermission
                      ? hasPermission(link.requiredPermission, {
                          type: link.permissionType ?? 'and',
                        })
                      : true
                  ).map((sidebarLink) => {
                    return (
                      <Link
                        key={`desktop-${sidebarLink.messagesKey}`}
                        href={sidebarLink.href}
                        as={sidebarLink.as}
                        className={`group flex items-center rounded-2xl border px-4 py-3 text-lg font-semibold leading-6 transition duration-200 ease-in-out focus:outline-none
                        ${
                          router.pathname.match(sidebarLink.activeRegExp)
                            ? 'border-transparent bg-white text-[#0b0b0f] shadow-[0_14px_35px_rgba(0,0,0,0.45)]'
                            : 'border-transparent text-slate-300 hover:border-[#1f1f2a] hover:bg-[#0f1016] hover:text-white'
                        }`}
                        data-testid={sidebarLink.dataTestId}
                      >
                        <div className="mr-2 text-xl text-inherit">
                          {sidebarLink.svgIcon}
                        </div>
                        <div className="flex flex-col text-left leading-6">
                          <span
                            className={`text-base font-semibold ${
                              router.pathname.match(sidebarLink.activeRegExp)
                                ? 'text-[#0b0b0f]'
                                : 'text-inherit'
                            }`}
                          >
                            {intl.formatMessage(
                              menuMessages[sidebarLink.messagesKey]
                            )}
                          </span>
                          {sidebarLink.descriptionKey && (
                            <span
                              className={`text-xs font-medium ${
                                router.pathname.match(sidebarLink.activeRegExp)
                                  ? 'text-slate-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {intl.formatMessage(
                                menuDescriptions[sidebarLink.descriptionKey]
                              )}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>
              <div className="mt-4 border-t border-[#12121a] px-4 pb-6 pt-4 text-[12px] text-slate-400">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Need Help?
                </div>
                <div className="mt-1 space-y-1">
                  <Link
                    href="https://apexnova.live"
                    className="block hover:text-white"
                  >
                    Apex Nova Dashboard
                  </Link>
                  <Link
                    href="https://apexnova.live/wiki"
                    className="block hover:text-white"
                  >
                    Apex Nova Wiki
                  </Link>
                </div>
                <div className="mt-2 text-[11px] text-slate-600">v1</div>
              </div>
              <div className="px-2">
                <UserWarnings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
