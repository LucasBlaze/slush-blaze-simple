/*
 * slush-blaze-simple
 * https://github.com/seu-nome/slush-mean
 *
 * Copyright (c) 2014, Seu Nome
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
	install = require('gulp-install'),
	conflict = require('gulp-conflict'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	_ = require('underscore.string'),
	inquirer = require('inquirer'),
	path = require('path');

function format(string) {
	var username = string.toLowerCase();
	return username.replace(/\s/g, '');
}


var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: osUserName || format(user.name || ''),
        authorEmail: user.email || ''
    };
})();


console.log([
    '',
    '                Blaze  Simple',
    '               Slush Generator',
    '            I hope you enjoy it :)',
    '',
    '     Lucas Blaze | luckasprimo@gmail.com',
    '',
    ''
  ].join('\n'));


gulp.task('default', function (done) {
    
    var prompts = [{
      name: 'appName',
      message: 'What is the name of your project?',
      default: defaults.appName
      }, {
        name: 'appDescription',
        message: 'What is the description?'
      }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
      }, {
        name: 'appAuthor',
        message: 'What is the author name?',
        default: defaults.authorName
      }, {
        name: 'appEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
      }, {
        type: 'list',
        name: 'selectPreprocessor',
        message: 'What preprocessor you want to use?',
        choices: [
          { name: 'stylus', value: 'stylus' },
          { name: 'sass', value: 'sass' },
        ],
        default: 0
      }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
      }];
    
    inquirer.prompt(prompts,
    function (answers) {
      if (!answers.moveon) {
        return done();
      }
      answers.appNameSlug = _.slugify(answers.appName);
        
      gulp.src(__dirname + '/templates/' + answers.selectPreprocessor + '/**')
        .pipe(template(answers))
        .pipe(rename(function(file) {
          if (file.basename[0] === '_') {
            file.basename = '.' + file.basename.slice(1);
          }
        }))
        .pipe(rename(function(file) {
          if (file.basename[0] === '-') {
            file.basename = '_' + file.basename.slice(1);
          }
        }))
        .pipe(conflict('./'))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .on('end', function () {
          done();
        });
    });
});
