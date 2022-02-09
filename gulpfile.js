const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');



//автообновлние браузера
function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

//очистка dist от ненужных файлов
function cleanDist() {
    return del('dist');
}

//сжатие картинок
function images() {
    return src('app/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/img'));
}

//слежение за изменениями в js
function scripts() {
    return src(
            'app/js/main.js'
        )
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

//преобразование scss в css
function styles() {
    return src('app/scss/style.scss') 
        .pipe(scss({
            outputStyle: 'compressed'
        })) 
        .pipe(concat('style.min.css')) 
        .pipe(autoprefixer({
            overrideBrowserlist: ['last 10 version'],
            grid: true
        })) 
        .pipe(dest('app/css')) 
        .pipe(browserSync.stream()); 
}

//перекидывание "чистых", сжатых файлов в dist
function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/*.js',
            'app/*.html'
        ], {
            base: 'app'
        })
        .pipe(dest('dist'));
}

// слежение за изменениями 
function watching() {
    watch(['app/scss/**/*.scss'], styles); 
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); 
    watch('app/*.html').on('change', browserSync.reload); 

}


exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);