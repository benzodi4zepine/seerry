import PageTitle from '@app/components/Common/PageTitle';
import type { Undefinable } from '@app/utils/typeHelpers';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import type { NextPage } from 'next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const getErrorMessage = (statusCode?: number) => {
    switch (statusCode) {
      case 500:
        return 'Internal Server Error';
      case 503:
        return 'Service Unavailable';
      default:
        return statusCode ? 'Something Went Wrong' : 'Oops';
    }
  };

  const errorMessage = getErrorMessage(statusCode);
  const fullMessage = statusCode
    ? `${statusCode} - ${errorMessage}`
    : errorMessage;

  return (
    <div className="error-message flex min-h-screen flex-col items-center justify-center">
      <PageTitle title={errorMessage} />
      <div className="text-4xl font-bold text-white">{fullMessage}</div>
      <Link
        href="/"
        className="mt-4 flex items-center text-indigo-500 hover:text-indigo-400"
      >
        Return Home
        <ArrowRightCircleIcon className="ml-2 h-6 w-6" />
      </Link>
    </div>
  );
};

Error.getInitialProps = async ({ res, err }): Promise<ErrorProps> => {
  // Apologies for how gross ternary is but this is just temporary. Honestly,
  // blame the nextjs docs
  let statusCode: Undefinable<number>;
  if (res) {
    statusCode = res.statusCode;
  } else {
    statusCode = err ? err.statusCode : undefined;
  }

  return { statusCode };
};

export default Error;
