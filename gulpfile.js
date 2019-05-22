const {src, dest, task, series, parallel, watch} = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

// styles task dev
task('styles-dev', () => {
    return src('./src/assets/sass/**/*.*')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./src/assets/css'))
        .pipe(browserSync.stream());
});
// styles task build
task('styles-build', () => {
    return src('./src/assets/sass/**/*.*')
        .pipe(sass())
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(dest('./build/assets/css'))
        .pipe(browserSync.stream());
});

// scripts task dev
task('scripts-dev', () => {
    return src(['./src/assets/js/**/*.*', '!src/assets/js/**/*.min.js', '!src/assets/js/**/*.min.js.map'])
        .pipe(sourcemaps.init())
        .pipe(concat('script.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./src/assets/js'))
        .pipe(browserSync.stream());
});
// scripts task build
task('scripts-build', () => {
    return src(['./src/assets/js/**/*.*', '!src/assets/js/**/*.min.js', '!src/assets/js/**/*.min.js.map'])
        .pipe(concat('script.min.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(dest('./build/assets/js'))
        .pipe(browserSync.stream());
});

// images task build
task('images-build', () => {
   return src('./src/assets/images/**')
       .pipe(imagemin([
           imagemin.jpegtran({progressive: true}),
           imagemin.optipng({optimizationLevel: 5}),
           imagemin.svgo({
               plugins: [
                   {removeViewBox: true},
                   {cleanupIDs: false}
               ]
           })
       ]))
       .pipe(dest('./build/assets/images'))
});

// libs task build
task('libs-build', () => {
    return src('./src/assets/libs/**/*.*')
        .pipe(dest('./build/assets/libs'))
});

// root files build
task('root-build', () => {
    return src('./src/*.*')
        .pipe(dest('./build/'))
});

// delete build
task('clean', () => {
    return del(['build/*']);
});

// watch
task('watch', () => {
    browserSync.init({
        server: {
            baseDir: './src'
        }
    });
    watch('./src/assets/images/**');
    watch('./src/assets/sass/**/*.sass', series('styles-dev'));
    watch(['./src/assets/js/**/*.*', '!src/assets/js/**/*.min.js', '!src/assets/js/**/*.min.js.map'], series('scripts-dev'));
    watch('./src/*.html').on('change', browserSync.reload);
});

// default/dev task
task('default', series(parallel('styles-dev', 'scripts-dev'), 'watch'));

// build task
task('build', series('clean', parallel('styles-build', 'scripts-build', 'images-build', 'libs-build', 'root-build')));