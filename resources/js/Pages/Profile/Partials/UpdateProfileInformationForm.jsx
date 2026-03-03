import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/context/ThemeContext';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    // ── Dark mode classes ──
    const themeClasses = {
        headerTitle: isDark ? 'text-gray-100' : 'text-gray-900',
        headerDesc: isDark ? 'text-gray-400' : 'text-gray-600',
        text: isDark ? 'text-gray-300' : 'text-gray-700',
        link: isDark ? 'text-gray-400 hover:text-gray-100 focus:ring-gray-600' : 'text-gray-600 hover:text-gray-900 focus:ring-indigo-500',
        successText: isDark ? 'text-green-400' : 'text-green-600',
        savedText: isDark ? 'text-gray-400' : 'text-gray-600',
        verificationText: isDark ? 'text-gray-200' : 'text-gray-800',
    };

    return (
        <section className={className}>
            <header>
                <h2 className={`text-lg font-medium ${themeClasses.headerTitle}`}>
                    Profile Information
                </h2>

                <p className={`mt-1 text-sm ${themeClasses.headerDesc}`}>
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className={`mt-2 text-sm ${themeClasses.verificationText}`}>
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className={`rounded-md text-sm underline focus:outline-none focus:ring-2 focus:ring-offset-2 ml-1 ${themeClasses.link}`}
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className={`mt-2 text-sm font-medium ${themeClasses.successText}`}>
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className={`text-sm ${themeClasses.savedText}`}>
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
