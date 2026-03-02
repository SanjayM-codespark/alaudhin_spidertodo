import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // ✅ Enables dark mode via the `dark` class on <html>

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
        './resources/js/**/*.tsx', // ✅ Added: covers all your .tsx component files
        './resources/js/**/*.ts',  // ✅ Added: covers .ts files too
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans], // ✅ Updated to Poppins
            },
        },
    },

    plugins: [forms],
};
