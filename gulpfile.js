const gulp = require('gulp');
const {series, parallel} = gulp;
const ghPages = require('gulp-gh-pages');

const sass = require('gulp-sass');
//const fontgen = require('gulp-fontgen');
const browserSync = require('browser-sync').create();

const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
//const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const concat = require('concat');
const htmlmin = require('gulp-htmlmin');

// DEV TASK (SCSS -> CSS)
const style = () => {
    return gulp.src('app/styles/scss/style.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/styles/'))
        .pipe(browserSync.stream());
};

// BUILD PROJECT TO 'dist/', MINIFY, AUTOPREFIX
const cleanBuild = () => {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
};

// IMAGES
const minimizeImages = () => {
    return gulp.src('app/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
};

// STYLES
const minimizeStyles = () => {
    return gulp.src('app/styles/style.css')
        .pipe(autoprefixer({
            cascade: false,
        }))
        .pipe(cleanCSS({
            level: {
                1: {specialComments: 0}
            }
        }))
        .pipe(gulp.dest('dist/styles/'));
};

// JAVASCRIPT
const minimizeScripts = () => {
    return gulp.src('app/javascript/all.js')
        .pipe(terser())
        .pipe(gulp.dest('dist/javascript/'));
};

const jsLibs = () => {
    return concat([
        // 'node_modules/caniuse-lite/dist/lib/supported.js',
        // 'node_modules/dateformat/lib/dateformat.js',
    ], 'app/javascript/libs.js')
};
const allJs = () => {
    return concat([
        'app/javascript/custom.js',
        'app/javascript/libs.js',
    ], 'app/javascript/all.js')
};

//HTML
const minimizeHTML = () => {
    return gulp.src('app/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
};

//FONTS
const fonts = () => {
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'));
};

const watch = () => {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    })
    gulp.watch('app/styles/scss/**/*.scss', style);
    gulp.watch('app/javascript/custom.js', allJs);
    gulp.watch('app/*.html').on('change', browserSync.reload);
    //gulp.watch('app/fonts/*.{ttf, otf}', fonts);
};

// BUILD
const deployOnGhPages = () => {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
}

exports.deploy = series(deployOnGhPages);

exports.style = series(style);
exports.clean = series(cleanBuild);

exports.watch = series(watch);
exports.jsLibs = series(jsLibs, allJs);

exports.build = series(
    cleanBuild,
    parallel(minimizeImages, minimizeStyles, minimizeScripts, minimizeHTML, fonts),
);